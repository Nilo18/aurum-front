# Code formatting

- Always format code you create or edit before finishing a task.
- Follow `.editorconfig` and the Prettier configuration in `package.json`, including two-space indentation, single quotes, a 100-column print width, and the Angular parser for HTML templates.
- Keep HTML, SCSS, and TypeScript readable; do not compress templates, style rules, or logic into dense single lines.
- Run Prettier on changed HTML, SCSS, and TypeScript files, then verify them with Prettier `--check` before reporting completion.

# Staff section ownership

- Keep each staff section's behavior, form defaults, and explicit form template in its own component directory.
- Keep form fields independent of table columns so changing an add/edit form does not implicitly change the list.
- Share presentation styles, formatting helpers, and data services where useful; do not consolidate section logic into a generic workspace component or central field configuration.
