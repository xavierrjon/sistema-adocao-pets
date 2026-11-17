import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import { makeAnimal } from "@/test/animals";
import { AnimalForm } from "./AnimalForm";

const animal = makeAnimal();

function renderCreateForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <AnimalForm
      submitLabel="Cadastrar animal"
      submittingLabel="Cadastrando..."
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
}

function renderEditForm(
  onSubmit = vi.fn().mockResolvedValue(undefined),
  initialAnimal = animal,
) {
  render(
    <AnimalForm
      initialAnimal={initialAnimal}
      submitLabel="Salvar alterações"
      submittingLabel="Salvando..."
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
}

async function fillCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nome/), "Amber");
  await user.selectOptions(screen.getByLabelText(/^Espécie/), "Gato");
  await user.type(screen.getByLabelText(/^Raça/), "SRD");
  await user.selectOptions(screen.getByLabelText(/^Sexo/), "Femea");
  await user.selectOptions(screen.getByLabelText(/^Porte/), "Medio");
  await user.type(screen.getByLabelText(/^Descrição/), "Gatinha dócil que procura um lar.");
  await user.type(screen.getByLabelText(/^WhatsApp/), "11999999999");
}

describe("AnimalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe erros de validação quando campos obrigatórios estão vazios", async () => {
    const user = userEvent.setup();
    const onSubmit = renderCreateForm();

    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(screen.getByText("Informe o nome do animal.")).toBeInTheDocument();
    expect(screen.getByText("Selecione a espécie.")).toBeInTheDocument();
    expect(screen.getByText("Informe a raça do animal.")).toBeInTheDocument();
    expect(screen.getByText("Selecione o sexo.")).toBeInTheDocument();
    expect(screen.getByText("Selecione o porte.")).toBeInTheDocument();
    expect(screen.getByText("Escreva uma descrição sobre o animal.")).toBeInTheDocument();
    expect(screen.getByText("Informe o WhatsApp para contato.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("valida o formato do WhatsApp", async () => {
    const user = userEvent.setup();
    const onSubmit = renderCreateForm();

    await user.type(screen.getByLabelText(/^WhatsApp/), "123");
    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(screen.getByText("WhatsApp deve conter 10 ou 11 dígitos, com DDD.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia os dados normalizados do cadastro", async () => {
    const user = userEvent.setup();
    const onSubmit = renderCreateForm();

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Amber",
      species: "Gato",
      breed: "SRD",
      sex: "Femea",
      size: "Medio",
      description: "Gatinha dócil que procura um lar.",
      whatsapp: "11999999999",
    });
  });

  it("preenche os campos com os dados atuais no modo de edição", () => {
    renderEditForm();

    expect(screen.getByLabelText(/^Nome/)).toHaveValue("Amber");
    expect(screen.getByLabelText(/^Espécie/)).toHaveValue("Gato");
    expect(screen.getByLabelText(/^Raça/)).toHaveValue("SRD");
    expect(screen.getByLabelText(/^Sexo/)).toHaveValue("Femea");
    expect(screen.getByLabelText(/^Porte/)).toHaveValue("Medio");
    expect(screen.getByLabelText(/^Descrição/)).toHaveValue(animal.description);
    // O WhatsApp salvo não é retornado pela API, por isso começa em branco.
    expect(screen.getByLabelText(/^WhatsApp/)).toHaveValue("");
  });

  it("envia a edição sem WhatsApp quando o campo fica em branco", async () => {
    const user = userEvent.setup();
    const onSubmit = renderEditForm();

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe(animal.name);
    expect(payload).not.toHaveProperty("whatsapp");
  });

  it("envia a edição com o novo WhatsApp quando informado", async () => {
    const user = userEvent.setup();
    const onSubmit = renderEditForm();

    await user.type(screen.getByLabelText(/^WhatsApp/), "21988887777");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ whatsapp: "21988887777" }),
    );
  });

  it("mapeia erros de validação da API para os campos", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError("Dados inválidos.", 400, [
        { field: "name", message: "Nome é obrigatório." },
      ]),
    );
    renderEditForm(onSubmit);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByText("Nome é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("Revise os campos destacados e tente novamente.")).toBeInTheDocument();
  });

  it("exibe a mensagem da API quando a operação é negada", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError("Você não tem permissão para editar este animal.", 403),
    );
    renderEditForm(onSubmit);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      await screen.findByText("Você não tem permissão para editar este animal."),
    ).toBeInTheDocument();
  });

  it("indica o envio em andamento e evita envios duplicados", async () => {
    const user = userEvent.setup();
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn().mockImplementation(
      () => new Promise<void>((resolve) => (resolveSubmit = resolve)),
    );
    renderCreateForm(onSubmit);

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(screen.getByRole("button", { name: "Cadastrando..." })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Cadastrando..." }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit();
  });

  it("reabilita o botão após falha do envio", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new ApiError("Erro interno do servidor.", 500));
    renderCreateForm(onSubmit);

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(await screen.findByText("Erro interno do servidor.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cadastrar animal" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
