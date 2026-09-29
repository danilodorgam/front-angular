/**
 * Move o foco para o elemento indicado. Elementos não focáveis (main, nav, footer, h1)
 * recebem `tabindex="-1"` para aceitar foco programático sem entrar na ordem do Tab.
 */
export function focusElementById(id: string, doc: Document = document): boolean {
  const element = doc.getElementById(id);
  if (!element) {
    return false;
  }
  if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }
  element.focus();
  return true;
}
