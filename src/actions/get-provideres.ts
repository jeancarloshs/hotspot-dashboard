"use server";

const teste = async (_: unknown, formData: FormData) => {
    console.log("Teste", Object.fromEntries(formData))
}

export default teste;