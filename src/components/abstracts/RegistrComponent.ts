import Handlebars from "handlebars";
import { HelperOptions } from "handlebars";
import Block, { BlockOwnProps } from "./Block"; // Обязательно импортируем BlockOwnProps

/** Уникальный инкрементальный идентификатор для заглушки */
let uniqueId = 0;

interface ComponentClass<Props extends BlockOwnProps> {
  new (props: Props): Block<Props>;
  componentName: string;
}

export function registerComponent<Props extends BlockOwnProps>(
  Component: ComponentClass<Props>,
) {
  Handlebars.registerHelper(
    Component.componentName,
    function ({ hash, data }: HelperOptions) {
      const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;
      
      const component = new Component(hash as Props);

      if ("ref" in hash) {
        const rootRefs = (data.root.__refs = data.root.__refs || {});
        const element = component.element();
        if (!element) {
          throw new Error(`Component ${Component.componentName} has no DOM element.`);
        }
        rootRefs[hash.ref] = element;
      }

      (data.root.__children = data.root.__children || []).push({
        component,
        embed(node: DocumentFragment) {
          const placeholder = node.querySelector(`[${dataAttribute}]`);
          if (!placeholder) {
            throw new Error(
              `Can't find data-id for component ${Component.componentName}.`
            );
          }

          const element = component.element();
          if (!element) {
            throw new Error(
              `Component ${Component.componentName}.element() returned null.`
            );
          }

          placeholder.replaceWith(element);
        },
      });

      return `<div ${dataAttribute}></div>`;
    },
  );
}
