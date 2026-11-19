"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AnimalImageField } from "./AnimalImageField";
import { detailsToFieldErrors } from "@/lib/form-errors";
import { ApiError } from "@/services/api";
import { getCities, getStates, type IbgeState } from "@/services/location";
import type { Animal } from "@/types/animal";

/** Opções alinhadas aos enums aceitos pelo backend (schemas de animals). */
export const ANIMAL_SPECIES_OPTIONS = ["Cachorro", "Gato", "Outro"] as const;
export const ANIMAL_SEX_OPTIONS = ["Macho", "Femea"] as const;
export const ANIMAL_SIZE_OPTIONS = ["Pequeno", "Medio", "Grande"] as const;

const WHATSAPP_PATTERN = /^\d{10,11}$/;
const NAME_MAX_LENGTH = 60;
const BREED_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 1000;

/** Mesmas regras validadas pelo backend (middleware de upload e storage). */
const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

/**
 * Dados normalizados enviados pelo formulário.
 * O WhatsApp é opcional porque a API não devolve o contato salvo (medida de
 * privacidade); no modo de edição ele só é enviado quando o usuário o preenche.
 */
export type AnimalFormPayload = {
  name: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  description: string;
  state: string;
  city: string;
  whatsapp?: string;
};

/** Imagem selecionada no formulário e enviada junto com os dados do anúncio. */
export type AnimalFormImage = {
  file: File | null;
  /** Apenas no modo de edição: remove a foto atual sem enviar outra. */
  removeImage: boolean;
};

type AnimalFormValues = {
  name: string;
  species: string;
  breed: string;
  sex: string;
  size: string;
  description: string;
  state: string;
  city: string;
  whatsapp: string;
};

type FieldErrors = Partial<Record<keyof AnimalFormValues, string>>;

type AnimalFormProps = {
  /** Quando informado, o formulário opera em modo de edição e pré-preenche os campos. */
  initialAnimal?: Animal;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: AnimalFormPayload, image: AnimalFormImage) => Promise<void>;
};

const EMPTY_VALUES: AnimalFormValues = {
  name: "",
  species: "",
  breed: "",
  sex: "",
  size: "",
  description: "",
  state: "",
  city: "",
  whatsapp: "",
};

/** O WhatsApp salvo não é retornado pela API, por isso não pode ser pré-preenchido. */
function valuesFromAnimal(animal: Animal): AnimalFormValues {
  return {
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    sex: animal.sex,
    size: animal.size,
    description: animal.description,
    state: animal.state ?? "",
    city: animal.city ?? "",
    whatsapp: "",
  };
}

export function AnimalForm({ initialAnimal, submitLabel, submittingLabel, onSubmit }: AnimalFormProps) {
  const isEditing = Boolean(initialAnimal);
  const existingImageUrl = initialAnimal?.imageUrl ?? null;
  const [values, setValues] = useState<AnimalFormValues>(() =>
    initialAnimal ? valuesFromAnimal(initialAnimal) : EMPTY_VALUES,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Localização carregada do IBGE. `locationRetry` permite tentar novamente
  // sem recarregar a página quando a API pública falha.
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [statesError, setStatesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [locationRetry, setLocationRetry] = useState(0);

  // Estado da imagem: arquivo novo, prévia e remoção da foto atual (edição).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setIsLoadingStates(true);
    setStatesError(null);

    getStates(controller.signal)
      .then((data) => {
        if (active) setStates(data);
      })
      .catch((error: unknown) => {
        if (active && !isAbortError(error)) {
          setStatesError("Não foi possível carregar os estados. Verifique sua conexão e tente novamente.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingStates(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [locationRetry]);

  useEffect(() => {
    const state = values.state;

    if (!state) {
      setCities([]);
      setCitiesError(null);
      setIsLoadingCities(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    setCities([]);
    setCitiesError(null);
    setIsLoadingCities(true);

    getCities(state, controller.signal)
      .then((data) => {
        if (active) setCities(data);
      })
      .catch((error: unknown) => {
        if (active && !isAbortError(error)) {
          setCitiesError("Não foi possível carregar as cidades deste estado. Tente novamente.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingCities(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [values.state, locationRetry]);

  function setValue<K extends keyof AnimalFormValues>(key: K, value: AnimalFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  function handleStateChange(event: ChangeEvent<HTMLSelectElement>) {
    const state = event.target.value;
    setValues((previous) => ({ ...previous, state, city: "" }));
    // A cidade selecionada deixou de ser válida para a nova UF.
    setFieldErrors((previous) => ({ ...previous, state: undefined, city: undefined }));
  }

  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    setValue("city", event.target.value);
    setFieldErrors((previous) => ({ ...previous, city: undefined }));
  }

  function clearSelectedImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    // Permite selecionar o mesmo arquivo novamente depois de um erro.
    event.target.value = "";

    if (!file) return;

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setImageError("Formato não suportado. Selecione uma imagem JPEG, PNG ou WebP.");
      return;
    }

    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      setImageError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    clearSelectedImage();
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
    setImageError(null);
  }

  function handleRemoveImage() {
    clearSelectedImage();
    // No modo de edição, a remoção precisa ser comunicada à API ao salvar.
    setRemoveImage(Boolean(existingImageUrl));
    setImageError(null);
  }

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!values.name.trim()) {
      errors.name = "Informe o nome do animal.";
    }

    if (!values.species) {
      errors.species = "Selecione a espécie.";
    }

    if (!values.breed.trim()) {
      errors.breed = "Informe a raça do animal.";
    }

    if (!values.sex) {
      errors.sex = "Selecione o sexo.";
    }

    if (!values.size) {
      errors.size = "Selecione o porte.";
    }

    if (!values.description.trim()) {
      errors.description = "Escreva uma descrição sobre o animal.";
    }

    if (!values.state) {
      errors.state = "Selecione o estado.";
    }

    if (!values.city) {
      errors.city = "Selecione a cidade.";
    }

    const whatsapp = values.whatsapp.replace(/\D/g, "");

    if (!whatsapp && !isEditing) {
      errors.whatsapp = "Informe o WhatsApp para contato.";
    } else if (whatsapp && !WHATSAPP_PATTERN.test(whatsapp)) {
      errors.whatsapp = "WhatsApp deve conter 10 ou 11 dígitos, com DDD.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !validate()) return;

    setFormError(null);
    setIsSubmitting(true);

    const whatsapp = values.whatsapp.replace(/\D/g, "");

    try {
      await onSubmit(
        {
          name: values.name.trim(),
          species: values.species,
          breed: values.breed.trim(),
          sex: values.sex,
          size: values.size,
          description: values.description.trim(),
          state: values.state,
          city: values.city,
          ...(whatsapp ? { whatsapp } : {}),
        },
        {
          file: imageFile,
          removeImage: !imageFile && removeImage,
        },
      );
    } catch (error) {
      if (error instanceof ApiError && error.details && error.details.length > 0) {
        setFieldErrors(detailsToFieldErrors(error) as FieldErrors);
        setFormError("Revise os campos destacados e tente novamente.");
      } else {
        setFormError(
          error instanceof Error && error.message
            ? error.message
            : "Não foi possível salvar o anúncio. Tente novamente.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Mantém o valor atual visível mesmo se a lista do IBGE ainda não carregou
  // (edição) ou se a consulta falhou — evita perder a seleção existente.
  const stateOptions = [
    ...(values.state && !states.some((item) => item.sigla === values.state)
      ? [{ value: values.state, label: values.state }]
      : []),
    ...states.map((item) => ({ value: item.sigla, label: `${item.nome} (${item.sigla})` })),
  ];
  const cityOptions = values.city && !cities.includes(values.city) ? [values.city, ...cities] : cities;

  const stateHint = isLoadingStates
    ? "Carregando estados..."
    : states.length === 0 && !statesError
      ? "Nenhum estado disponível no momento."
      : undefined;
  const cityHint = !values.state
    ? "Selecione um estado primeiro."
    : isLoadingCities
      ? "Carregando cidades..."
      : cities.length === 0 && !citiesError
        ? "Nenhuma cidade disponível para este estado."
        : undefined;
  const locationHasError = Boolean(statesError || citiesError);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </p>
      ) : null}

      <p className="text-sm text-slate-500">
        Campos com <span aria-hidden="true" className="text-red-600">*</span> são obrigatórios.
      </p>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-extrabold text-brand-950">Sobre o animal</h2>

        <TextField
          id="animal-name"
          label="Nome"
          placeholder="Ex.: Amber"
          maxLength={NAME_MAX_LENGTH}
          autoComplete="off"
          value={values.name}
          onChange={(event) => setValue("name", event.target.value)}
          error={fieldErrors.name}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="animal-species"
            label="Espécie"
            placeholder="Selecione a espécie"
            options={ANIMAL_SPECIES_OPTIONS}
            value={values.species}
            onChange={(event) => setValue("species", event.target.value)}
            error={fieldErrors.species}
          />

          <TextField
            id="animal-breed"
            label="Raça"
            hint="Use SRD quando não souber a raça."
            placeholder="Ex.: SRD"
            maxLength={BREED_MAX_LENGTH}
            autoComplete="off"
            value={values.breed}
            onChange={(event) => setValue("breed", event.target.value)}
            error={fieldErrors.breed}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="animal-sex"
            label="Sexo"
            placeholder="Selecione o sexo"
            options={ANIMAL_SEX_OPTIONS}
            value={values.sex}
            onChange={(event) => setValue("sex", event.target.value)}
            error={fieldErrors.sex}
          />

          <SelectField
            id="animal-size"
            label="Porte"
            placeholder="Selecione o porte"
            options={ANIMAL_SIZE_OPTIONS}
            value={values.size}
            onChange={(event) => setValue("size", event.target.value)}
            error={fieldErrors.size}
          />
        </div>

        <TextareaField
          id="animal-description"
          label="Descrição"
          hint="Conte sobre o temperamento, os cuidados e o histórico do animal."
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
          error={fieldErrors.description}
        />
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-brand-950">Localização</h2>
          <p className="mt-1 text-sm text-slate-500">
            Informe onde o animal está. Estados e cidades vêm da lista oficial do IBGE.
          </p>
        </div>

        {locationHasError ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3">
            {/* O erro específico já é anunciado junto ao campo; aqui apenas
                concentramos a mensagem e a ação de tentar novamente. */}
            <p role="status" className="text-sm font-semibold text-red-700">
              {statesError ?? citiesError}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setLocationRetry((attempt) => attempt + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="animal-state"
            label="Estado (UF)"
            placeholder={isLoadingStates ? "Carregando estados..." : "Selecione o estado"}
            options={stateOptions}
            value={values.state}
            onChange={handleStateChange}
            hint={stateHint}
            error={fieldErrors.state ?? statesError ?? undefined}
            aria-busy={isLoadingStates}
          />

          <SelectField
            id="animal-city"
            label="Cidade"
            placeholder={isLoadingCities ? "Carregando cidades..." : "Selecione a cidade"}
            options={cityOptions}
            value={values.city}
            onChange={handleCityChange}
            hint={cityHint}
            error={fieldErrors.city ?? citiesError ?? undefined}
            disabled={!values.state || isLoadingCities || Boolean(statesError)}
            aria-busy={isLoadingCities}
          />
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-extrabold text-brand-950">Contato para adoção</h2>

        <TextField
          id="animal-whatsapp"
          label="WhatsApp"
          type="tel"
          inputMode="numeric"
          placeholder="11999999999"
          hint={
            isEditing
              ? "Deixe em branco para manter o WhatsApp atual."
              : "Apenas números, com DDD. Ex.: 11999999999"
          }
          maxLength={11}
          autoComplete="off"
          value={values.whatsapp}
          onChange={(event) => setValue("whatsapp", event.target.value.replace(/\D/g, ""))}
          error={fieldErrors.whatsapp}
        />
      </section>

      <AnimalImageField
        id="animal-image"
        existingImageUrl={existingImageUrl}
        previewUrl={previewUrl}
        selectedFileName={imageFile?.name ?? null}
        willRemoveExisting={!imageFile && removeImage}
        error={imageError}
        isSubmitting={isSubmitting}
        onSelectImage={() => fileInputRef.current?.click()}
        onRemoveImage={handleRemoveImage}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ALLOWED_TYPES.join(",")}
        onChange={handleImageChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}

type FieldWrapperProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function FieldWrapper({ id, label, error, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-brand-950">
        {label}
        <span aria-hidden="true" className="ml-0.5 text-red-600">
          *
        </span>
      </label>

      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">{children}</div>

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const FIELD_ERROR_CLASSES = "border-red-400 focus:border-red-500 focus:ring-red-500/15";
const FIELD_BASE_CLASSES =
  "border-slate-200 bg-white px-5 py-3 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

type TextFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "id" | "aria-describedby"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

function TextField({ id, label, error, hint, className, ...props }: TextFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ")
    .trim() || undefined;

  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        className={[
          "w-full rounded-full border",
          FIELD_BASE_CLASSES,
          error ? FIELD_ERROR_CLASSES : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
    </FieldWrapper>
  );
}

type SelectOption = { value: string; label: string };

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "aria-describedby" | "children"> & {
  id: string;
  label: string;
  placeholder: string;
  options: readonly (string | SelectOption)[];
  error?: string;
  hint?: string;
};

function SelectField({ id, label, placeholder, options, error, hint, className, ...props }: SelectFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ")
    .trim() || undefined;

  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        className={[
          "w-full rounded-full border",
          FIELD_BASE_CLASSES,
          error ? FIELD_ERROR_CLASSES : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </FieldWrapper>
  );
}

type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "aria-describedby"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

function TextareaField({ id, label, error, hint, className, ...props }: TextareaFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ")
    .trim() || undefined;

  return (
    <FieldWrapper id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={5}
        className={[
          "w-full rounded-2xl border",
          FIELD_BASE_CLASSES,
          error ? FIELD_ERROR_CLASSES : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
    </FieldWrapper>
  );
}
