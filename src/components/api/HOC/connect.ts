import store from '../store';
import Block, { type BlockOwnProps } from '../../abstracts/Block'

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isEqual(a: object, b: object): boolean {
  if (a === b) return true;

  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // Сравнение массивов
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      const valA = a[i];
      const valB = b[i];

      // Оба элемента — массивы: рекурсивно сравниваем
      if (isArray(valA) && isArray(valB)) {
        if (!isEqual(valA, valB)) return false;
      // Оба элемента — объекты: рекурсивно сравниваем
      } else if (isObject(valA) && isObject(valB)) {
        if (!isEqual(valA, valB)) return false;
      // Иначе — строгое сравнение примитивов
      } else if (valA !== valB) {
        return false;
      }
    }

    return true;
  }

  // Если один массив, а другой — нет
  if (isArray(a) || isArray(b)) return false;

  // Сравнение объектов
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!(key in b)) return false;

    const valA = (a as Record<string, unknown>)[key];
    const valB = (b as Record<string, unknown>)[key];

    if (isArray(valA) && isArray(valB)) {
      if (!isEqual(valA, valB)) return false;
    } else if (isObject(valA) && isObject(valB)) {
      if (!isEqual(valA, valB)) return false;
    } else if (valA !== valB) {
      return false;
    }
  }

  return true;
}

type Indexed<T = unknown> = {
  [key in string]: T;
};

function connect<Props extends BlockOwnProps>(
  mapStateToProps: (state: Indexed) => Indexed
) {
  return function (Component: typeof Block<Props>) {
    return class extends Component {
      constructor(props: Props) {
        let state = mapStateToProps(store.getState());

        super({ ...props, ...state });

        store.subscribe(() => {
          const newState = mapStateToProps(store.getState());

          if (!isEqual(state, newState)) {
            this.setProps({ ...newState } as Partial<Props>);
          }

          state = newState;
        });
      }
    };
  };
}
    
export { connect };
