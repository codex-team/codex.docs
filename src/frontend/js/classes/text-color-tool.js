class ColorPalette {
  constructor(config) {
    this.config = config;
    this.element = document.createElement('div');
    this.element.classList.add('color-palette');
    this.element.style.display = 'none';
    this.isOpen = false;

    const savedColor = localStorage.getItem('editorjs-text-color');
    this.config.currentColor = savedColor || this.config.defaultColor;

    // Кнопка сброса
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = '×';
    resetBtn.classList.add('color-palette-reset');
    resetBtn.addEventListener('click', () => {
      this.config.onReset();
      this.hide();
    });
    this.element.appendChild(resetBtn);

    // Цвета
    this.config.colors.forEach(color => {
      const colorBtn = document.createElement('button');
      colorBtn.type = 'button';
      colorBtn.style.backgroundColor = color;
      colorBtn.classList.add('color-palette-item');
      
      // Подсветка выбранного цвета
      if (color === this.config.currentColor) {
        colorBtn.classList.add('active');
      }

      colorBtn.addEventListener('click', () => {
        this.config.onSelect(color);
        this.config.currentColor = color;
        this.hide();
      });

      this.element.appendChild(colorBtn);
    });

    document.body.appendChild(this.element);

    // Закрытие при клике вне палитры
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.element.contains(e.target) && e.target !== this.config.anchor) {
        this.hide();
      }
    }, true);
  }

  toggle(anchor) {
    this.config.anchor = anchor;
    if (this.isOpen) {
      this.hide();
    } else {
      this.show(anchor);
    }
  }

  show(anchor) {
    const rect = anchor.getBoundingClientRect();
    this.element.style.position = 'absolute';
    this.element.style.top = `${rect.bottom + window.scrollY + 5}px`;
    this.element.style.left = `${rect.left + window.scrollX}px`;
    this.element.style.display = 'flex';
    this.isOpen = true;
  }

  hide() {
    this.element.style.display = 'none';
    this.isOpen = false;
  }
}

export class TextColorTool {
  constructor({ api, config }) {
    this.api = api;
    this.button = null;
    this.palette = null;
    this.state = false;
    this.config = {
      defaultColor: '#000000',
      colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
      ...config
    };
    this.lastUsedColor = localStorage.getItem('editorjs-text-color') || this.config.defaultColor;
    this.currentSelectionColor = null;
  }

  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      span: {
        style: true,
        class: true
      }
    };
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.updateButtonColor();
    this.button.classList.add('ce-inline-tool');

    this.palette = new ColorPalette({
      colors: this.config.colors,
      defaultColor: this.config.defaultColor,
      currentColor: this.lastUsedColor,
      anchor: this.button,
      onSelect: (color) => {
        this.applyColor(color);
        this.lastUsedColor = color;
        localStorage.setItem('editorjs-text-color', color);
        this.updateButtonColor();
        this.palette.hide();
      },
      onReset: () => {
        this.removeColor();
        this.lastUsedColor = this.config.defaultColor;
        localStorage.removeItem('editorjs-text-color');
        this.updateButtonColor();
        this.palette.hide();
      }
    });

    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.palette.toggle(this.button);
    });

    return this.button;
  }

  updateButtonColor() {
    if (!this.button) return;
    const displayColor = this.currentSelectionColor || this.lastUsedColor;
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="currentColor" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path fill="${displayColor}" d="M10 5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
      </svg>
    `;
  }

  applyColor(color) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const fragment = range.extractContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);
    
    this._applyStyleToContent(tempDiv, color);
    
    range.insertNode(tempDiv);
    
    while (tempDiv.firstChild) {
      tempDiv.parentNode.insertBefore(tempDiv.firstChild, tempDiv);
    }
    tempDiv.remove();
    
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStart(range.startContainer, range.startOffset);
    newRange.setEnd(range.endContainer, range.endOffset);
    selection.addRange(newRange);
    
    this.lastUsedColor = color;
    this.currentSelectionColor = color;
    localStorage.setItem('editorjs-text-color', color);
    this.updateButtonColor();
  }
  
  _applyStyleToContent(element, color) {
    const nodeIterator = document.createNodeIterator(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    );
    
    let currentNode;
    const nodesToProcess = [];
    
    while (currentNode = nodeIterator.nextNode()) {
      nodesToProcess.push(currentNode);
    }
    
    nodesToProcess.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const parentSpan = node.parentElement?.closest('span[style*="color"]');
        if (parentSpan) {
          parentSpan.style.color = color;
        } else {
          const span = document.createElement('span');
          span.style.color = color;
          node.parentNode.insertBefore(span, node);
          span.appendChild(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN' && node.style.color) {
        node.style.color = color;
      }
    });
  }

  removeColor() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const span = range.startContainer.parentElement?.closest('span[style*="color"]');
    if (span) {
      const text = document.createTextNode(span.textContent || '');
      span.replaceWith(text);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(text);
      selection.addRange(newRange);
    }
  }

  surround(range) {
    this.applyColor(this.lastUsedColor);
  }

  checkState() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.currentSelectionColor = null;
      return false;
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    
    const startColor = this.getTextColor(startNode);
    const endColor = this.getTextColor(endNode);
    
    if (startColor !== endColor) {
      this.currentSelectionColor = null;
      return false;
    }
    
    this.currentSelectionColor = startColor;
    
    if (startColor && startColor !== this.lastUsedColor) {
      this.lastUsedColor = startColor;
      this.updateButtonColor();
    }
    
    return !!startColor;
  }

  getTextColor(node) {
    const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    const coloredSpan = element?.closest('span[style*="color"]');
    if (!coloredSpan) {
      const computedColor = window.getComputedStyle(element).color;
      return computedColor === 'rgb(0, 0, 0)' ? '#000000' : null;
    }
    
    return this.rgbToHex(coloredSpan.style.color) || null;
  }
  
  rgbToHex(rgb) {
    if (!rgb) return null;
    
    const rgbMatch = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    if (!rgbMatch) return rgb;
    
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  static get shortcut() {
    return 'CMD+SHIFT+C';
  }
}
