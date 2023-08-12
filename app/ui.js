//----------------------------------------------------------------------------------------
class UiElement {
  constructor(sel, parent) {
    this.el = sel instanceof HTMLElement ? sel : (parent || document).querySelector(sel);
    this.addEventListener = this.el.addEventListener.bind(this.el);
    this.dispatchEvent = this.el.dispatchEvent.bind(this.el);
  }
  toggleClass(classNames, cond) {
    const list = this.el.classList;
    (cond ? list.add : list.remove).apply(list, classNames);
  }
}

//----------------------------------------------------------------------------------------
class Ui extends UiElement {
  constructor(sel, parent) {
    super(sel, parent);

    this.btnSignIn = new UiElement('.btn-sign-in');
    this.btnSignIn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ui:sign-in'));
    });

    this.listLabels = new UiLabels('.list-labels');
  }
  render({ labels } = {}) {
    if (labels) { this.listLabels.render(labels) }
  }
}

//----------------------------------------------------------------------------------------
class UiLabels extends UiElement {
  render(labels = []) {
    this.el.querySelectorAll(':scope > li').forEach(li => { li.remove() });
    labels.forEach(label => {
      new UiLabelItem(this.el.appendChild(UiLabelItem.createElement()))
        .render(label);
    });
  }
}

//----------------------------------------------------------------------------------------
class UiLabelItem extends UiElement {
  static createElement() {
    return document.createElement('li');
  }
  render({ name } = {}) {
    this.el.textContent = (name || '').toString();
  }
}
