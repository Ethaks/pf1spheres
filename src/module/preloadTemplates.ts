export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
  const templatePaths: string[] = [
    "modules/pf1spheres/templates/class-progression.hbs",
    "modules/pf1spheres/templates/talent-details.hbs",
  ];

  return loadTemplates(templatePaths);
}
