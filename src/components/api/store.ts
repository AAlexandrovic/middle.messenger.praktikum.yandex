type Listener = () => void;

type Indexed<T = unknown> = {
  [key in string]: T;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function merge(lhs: Indexed, rhs: Indexed): Indexed {
    const result: Indexed = { ...lhs };

  for (const key in rhs) {
    if (!Object.prototype.hasOwnProperty.call(rhs, key)) continue;

    const leftVal = lhs[key];
    const rightVal = rhs[key];

    // Если оба значения — объекты, делаем рекурсивное слияние
    if (isObject(leftVal) && isObject(rightVal)) {
      result[key] = merge(leftVal, rightVal) as Indexed;
    } else {
      // Иначе просто перезаписываем значением из rhs
      result[key] = rightVal;
    }
  }

  return result;
}

function set(object: Indexed | unknown, path: string, value: unknown): Indexed | unknown {
    if (!isObject(object)) {
        return object;
    }

    const keys = path.split('.').filter(Boolean);
    if (keys.length === 0) {
        return object;
    }

    // Приводим value к Indexed, чтобы reduceRight принял его как аккумулятор
    // const nested = keys.reduceRight<Indexed>((acc, key) => {
    //     return { [key]: acc } as Indexed;
    // }, value as Indexed);

    let current: Indexed = object; // Начинаем с корня

    // Проходим по всем ключам, КРОМЕ последнего
    for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    // Если следующего уровня нет или он не объект (но не массив!), создаем его
    if (!isObject(current[key])) {
        current[key] = {} as Indexed; 
    }
    // Спускаемся глубже
    current = current[key] as Indexed; 
    }

    // Теперь current указывает ровно на тот объект, куда нужно положить значение
    // Просто присваиваем value последнему ключу
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value; 

    return object; 
}

class Store {
  private state: Indexed = {};
  private listeners: Set<Listener> = new Set();
  
  public getState() {
    return this.state;
  }
  
  public setState(path: string, value: unknown): void {
    this.state = merge(this.state, set({}, path, value) as Indexed);
    // Уведомляем всех подписчиков об изменении
    this.emit();
  }

   public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    
    // Возвращаем функцию для отписки
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach(listener => listener());
  }
}

export default new Store();

/* const state = {};
const newState = merge(state, set({}, 'user.name', 'John'));
console.log(state); // {}
console.log(newState); // { user: { name: 'John' } }  */
