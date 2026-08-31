import Block from "../abstracts/Block";

export default class Error500Page extends Block {

  protected template = `
    <main class="main-content">
      <div class="error-page">
        <div class="error-page__content">
          <h1 class="error-page__code">500</h1>
          <p class="error-page__message">Мы уже фиксим</p>
          <a href="/" class="error-page__link router-link">Назад к чатам</a>
        </div>
      </div>
    </main>
  `;
}
