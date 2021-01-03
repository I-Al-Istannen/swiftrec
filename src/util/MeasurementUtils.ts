export function getSizeWithoutBorder(
  element: Element
): { width: number; height: number } {
  return element.getBoundingClientRect();
}

export function getSizeFull(
  element: Element
): { width: number; height: number } {
  const style = getComputedStyle(element);
  let width: number = parseFloat(style.width);
  let height: number = parseFloat(style.height);

  width += parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  width +=
    parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

  height += parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  height +=
    parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

  return {
    width: width,
    height: height
  };
}
