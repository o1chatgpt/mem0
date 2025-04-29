import yaml from "js-yaml"

export function parseYaml(yamlString: string): any {
  try {
    return yaml.load(yamlString)
  } catch (error) {
    console.error("Error parsing YAML:", error)
    return null
  }
}

export function stringifyYaml(data: any): string {
  try {
    return yaml.dump(data)
  } catch (error) {
    console.error("Error stringifying YAML:", error)
    return ""
  }
}
