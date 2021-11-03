```jsx
import { useLoaderData, useTransition, Link, Form } from "remix";

export default function Projects() {
  let projects = userLoaderData();
  let transition = useTransition();

  return (
    <div>
      {projects.map((project) => (
        <Link to={project.slug}>{project.title}</Link>
      ))}

      <Form method="post">
        <input name="title" />
        <button
          type="submit"
          disabled={Boolean(transition.state === "submitting")}
        >
          {submission.state === "submitting"
            ? "Creating..."
            : "Create New Project"}
        </button>
      </Form>
    </div>
  );
}

export async function loader({ request }) {
  return getUserProjects();
}

export async function action({ request }) {
  let form = await request.formData();
  return createProject({ title: form.get("title") });
}
```
