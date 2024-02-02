import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
export async function loader({ params }: LoaderFunctionArgs) {
    const { lang, ref } = params;
    return !ref ? redirect(`/docs/${lang}/main`) : null;
}