import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api";
import { makeAnimal } from "@/test/animals";
import { AnimalForm } from "./AnimalForm";

const animal = makeAnimal();

const createObjectURLMock = vi.fn(() => "blob:preview-da-imagem");
const revokeObjectURLMock = vi.fn();

beforeAll(() => {
  // jsdom não implementa URL.createObjectURL.
  Object.defineProperty(URL, "createObjectURL", {
    value: createObjectURLMock,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: revokeObjectURLMock,
    configurable: true,
    writable: true,
  });
});

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
    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: "Amber",
        species: "Gato",
        breed: "SRD",
        sex: "Femea",
        size: "Medio",
        description: "Gatinha dócil que procura um lar.",
        whatsapp: "11999999999",
      },
      expect.objectContaining({ file: null, removeImage: false }),
    );
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
      expect.objectContaining({ file: null, removeImage: false }),
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

describe("AnimalForm — imagem do animal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getFileInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("Campo de arquivo não encontrado");
    return input;
  }

  it("exibe a imagem atual no modo de edição", () => {
    render(
      <AnimalForm
        initialAnimal={{ ...animal, imageUrl: "https://res.cloudinary.com/exemplo/foto.jpg" }}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Foto atual do animal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Substituir imagem" })).toBeInTheDocument();
  });

  it("envia o arquivo selecionado junto com o cadastro", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <AnimalForm submitLabel="Cadastrar animal" submittingLabel="Cadastrando..." onSubmit={onSubmit} />,
    );

    const file = new File(["conteudo"], "amber.png", { type: "image/png" });
    await user.upload(getFileInput(container), file);

    expect(screen.getByAltText("Pré-visualização da imagem selecionada: amber.png")).toBeInTheDocument();

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const sentImage = onSubmit.mock.calls[0][1];
    expect(sentImage.file).toBe(file);
    expect(sentImage.removeImage).toBe(false);
  });

  it("permite substituir a imagem previamente selecionada", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <AnimalForm submitLabel="Cadastrar animal" submittingLabel="Cadastrando..." onSubmit={onSubmit} />,
    );

    const fileInput = getFileInput(container);
    await user.upload(fileInput, new File(["a"], "primeira.png", { type: "image/png" }));
    await user.upload(fileInput, new File(["b"], "segunda.png", { type: "image/png" }));

    expect(screen.getByAltText("Pré-visualização da imagem selecionada: segunda.png")).toBeInTheDocument();
    // A primeira prévia é revogada ao ser substituída.
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });

  it("rejeita arquivos com formato não permitido", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <AnimalForm submitLabel="Cadastrar animal" submittingLabel="Cadastrando..." onSubmit={onSubmit} />,
    );

    // user.upload respeita o atributo accept; um arquivo inesperado chegando
    // ao handler (ex.: arrastar outro tipo) é simulado com fireEvent.
    fireEvent.change(getFileInput(container), {
      target: { files: [new File(["x"], "documento.pdf", { type: "application/pdf" })] },
    });

    expect(
      await screen.findByText("Formato não suportado. Selecione uma imagem JPEG, PNG ou WebP."),
    ).toBeInTheDocument();
    expect(screen.queryByAltText(/Pré-visualização/)).not.toBeInTheDocument();
  });

  it("rejeita arquivos acima do limite de tamanho", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <AnimalForm submitLabel="Cadastrar animal" submittingLabel="Cadastrando..." onSubmit={onSubmit} />,
    );

    const bigFile = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], "grande.png", { type: "image/png" });
    await user.upload(getFileInput(container), bigFile);

    expect(await screen.findByText("A imagem deve ter no máximo 5 MB.")).toBeInTheDocument();
    expect(screen.queryByAltText(/Pré-visualização/)).not.toBeInTheDocument();
  });

  it("permite remover a imagem atual na edição e comunica a API", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <AnimalForm
        initialAnimal={{ ...animal, imageUrl: "https://res.cloudinary.com/exemplo/foto.jpg" }}
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remover imagem" }));

    expect(screen.getByText("A imagem atual será removida do anúncio quando você salvar as alterações.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^WhatsApp/), "21988887777");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][1]).toEqual({ file: null, removeImage: true });
  });

  it("descarta a seleção quando o usuário remove uma imagem nova no cadastro", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <AnimalForm submitLabel="Cadastrar animal" submittingLabel="Cadastrando..." onSubmit={onSubmit} />,
    );

    await user.upload(getFileInput(container), new File(["a"], "amber.png", { type: "image/png" }));
    await user.click(screen.getByRole("button", { name: "Remover imagem" }));

    expect(screen.getByAltText("Nenhuma imagem selecionada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remover imagem" })).not.toBeInTheDocument();

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Cadastrar animal" }));

    expect(onSubmit.mock.calls[0][1]).toEqual({ file: null, removeImage: false });
  });
});
