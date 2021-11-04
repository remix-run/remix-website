```tsx
export async function loader({ request }) {
  return getProjects();
}

export async function action({ request }) {
  let form = await request.formData();
  return createProject({
    title: form.get("title"),
  });
}

export default function Projects() {
  let projects = userLoaderData();
  let { state } = useTransition();
  let busy = state === "submitting";

  return (
    <div>
      {projects.map((project) => (
        <Link to={project.slug}>
          {project.title}
        </Link>
      ))}

      <Form method="post">
        <input name="title" />
        <button type="submit" disabled={busy}>
          {busy
            ? "Creating..."
            : "Create New Project"}
        </button>
      </Form>
    </div>
  );
}
```
