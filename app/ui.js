//----------------------------------------------------------------------------------------
class UiElement {
  constructor(sel, parent) {
    this.el = sel instanceof HTMLElement ? sel : (parent || document).querySelector(sel);
    this.addEventListener = this.el.addEventListener.bind(this.el);
    this.dispatchEvent = this.el.dispatchEvent.bind(this.el);
  }
  toggleClass(classNames, cond) {
    const classList = this.el.classList;
    (cond ? classList.add : classList.remove).apply(classList, classNames);
  }
  static createElement(tagName, classNames) {
    const el = document.createElement(tagName);
    if (classNames?.length > 0) { el.classList.add(...classNames) }
    return el;
  }
}

//----------------------------------------------------------------------------------------
class UiList extends UiElement {
  render({ items }) {
    this.el.querySelectorAll(':scope > li').forEach(el => { el.remove() });
    if (items) {
      items.forEach(item => {
        new UiListItem(this.el.appendChild(UiListItem.createElement()))
          .render(item);
      })
    }
  }
}
//----------------------------------------------------------------------------------------
class UiListItem extends UiElement {
  static createElement() {
    return super.createElement('li', ['list-group-item']);
  }
  render({ text }) {
    this.el.textContent = (text || '').toString();
  }
}

//========================================================================================
class Ui extends UiElement {
  constructor(sel, parent) {
    super(sel, parent);

    this.btnSignIn = new UiElement('.btn.sign-in');
    this.btnSignIn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ui:sign-in'));
    });

    this.listLabels = new UiLabelsList('.list-group.labels');
    this.listDebug = new UiDebugList('.list-group.debug');
  }
  render({ labels, debug }) {
    if (labels) { this.listLabels.render({ labels }) }
    if (debug) { this.listDebug.render({ debug }) }
  }
}

//----------------------------------------------------------------------------------------
class UiLabelsList extends UiList {
  render({ labels }) {
    super.render({ items: (labels || []).map(({ name }) => ({ text: name })) });
  }
}
//----------------------------------------------------------------------------------------
class UiDebugList extends UiList {
  render({ debug }) {
    if (debug?.items) super.render({ items: debug.items.map(text => ({ text })) });
  }
}
