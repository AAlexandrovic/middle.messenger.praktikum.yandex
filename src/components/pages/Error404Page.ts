import Block from "../abstracts/Block";

export default class Error404Page extends Block {

  protected template = `
    <main class="main-content">
      <div class="error-page">
        <div class="error-page__content">
          <h1 class="error-page__code">404</h1>
          <p class="error-page__message">Не туда попали</p>
          <a href="/" class="error-page__link router-link">Назад к чатам</a>
        </div>
      </div>
    </main>
  `;
}
