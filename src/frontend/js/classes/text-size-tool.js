class SizePalette {
  constructor(config) {
    this.config = config;
    this.element = document.createElement('div');
    this.element.classList.add('size-palette');
    this.element.style.display = 'none';
    this.isOpen = false;
    this.savedSelection = null;

    // Основной контейнер
    const container = document.createElement('div');
    container.classList.add('size-palette-container');
    
    // Поле для ввода
    const inputWrapper = document.createElement('div');
    inputWrapper.classList.add('size-input-wrapper');
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Size';
    this.input.classList.add('size-palette-input');
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = '✓';
    applyBtn.classList.add('size-apply-btn');
    
    inputWrapper.appendChild(this.input);
    inputWrapper.appendChild(applyBtn);
    container.appendChild(inputWrapper);

    // Список стандартных размеров
    const sizesList = document.createElement('div');
    sizesList.classList.add('size-palette-list');
    
    this.config.sizes.forEach(size => {
      const sizeBtn = document.createElement('button');
      sizeBtn.type = 'button';
      sizeBtn.textContent = size;
      sizeBtn.classList.add('size-palette-item');
      sizeBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.selectSize(size);
      });
      sizesList.appendChild(sizeBtn);
    });

    container.appendChild(sizesList);
    this.element.appendChild(container);
    document.body.appendChild(this.element);

    // Обработчики событий
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.applyCustomSize();
    });
    
    applyBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.applyCustomSize();
    });

    // Обработчик клика вне палитры
    this.clickOutsideHandler = (e) => {
      if (this.isOpen && !this.element.contains(e.target)) {
        this.hide();
        this.config.onClose();
      }
    };
    document.addEventListener('mousedown', this.clickOutsideHandler, true);
  }

  saveSelection() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.savedSelection = selection.getRangeAt(0).cloneRange();
    }
  }

  restoreSelection() {
    if (this.savedSelection) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.savedSelection);
    }
  }

  selectSize(size) {
    this.restoreSelection();
    this.config.onSelect(size);
    this.hide();
    // Не закрываем тулбар после выбора размера
    // this.config.onClose();
  }

  applyCustomSize() {
    const value = this.input.value.trim();
    if (value) {
      const size = value.endsWith('px') ? value : `${value}px`;
      this.selectSize(size);
    }
  }

  toggle(anchor) {
    if (this.isOpen) {
      this.hide();
      this.config.onClose();
    } else {
      this.saveSelection();
      this.show(anchor);
    }
  }

  show(anchor) {
    const rect = anchor.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    
    this.element.style.position = 'absolute';
    this.element.style.top = `${rect.bottom + scrollY + 5}px`;
    this.element.style.left = `${rect.left + scrollX}px`;
    this.element.style.display = 'block';
    this.isOpen = true;
    this.input.focus();
  }

  hide() {
    this.element.style.display = 'none';
    this.isOpen = false;
    this.input.value = '';
  }

  destroy() {
    document.removeEventListener('mousedown', this.clickOutsideHandler, true);
    this.element.remove();
  }
}

export class TextSizeTool {
  constructor({ api, config }) {
    this.api = api;
    this.button = null;
    this.palette = null;
    this.config = {
      defaultSize: '16px',
      sizes: ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'],
      ...config
    };
    this.currentSize = this.config.defaultSize;
    this.isToolbarOpen = false;
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
    this.updateButtonContent();
    this.button.classList.add('ce-inline-tool');

    this.palette = new SizePalette({
      sizes: this.config.sizes,
      anchor: this.button,
      onSelect: (size) => {
        // Применяем размер
        this.applySize(size);
        
        // Принудительно обновляем содержимое кнопки после применения размера
        this.api.toolbar.close();
        setTimeout(() => {
          this.api.toolbar.open();
          this.updateButtonContent();
        }, 10);
      },
      onClose: () => {
        // Закрываем тулбар только если палитра была закрыта без выбора размера
        if (this.isToolbarOpen) {
          this.closeToolbar();
        }
      }
    });

    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.palette.toggle(this.button);
      this.isToolbarOpen = !this.isToolbarOpen;
    });

    return this.button;
  }

  closeToolbar() {
    if (this.isToolbarOpen) {
      // Обновляем содержимое кнопки перед закрытием тулбара
      this.updateButtonContent();
      this.api.toolbar.close();
      this.isToolbarOpen = false;
    }
  }

  updateButtonContent() {
    // Извлекаем числовое значение размера для SVG
    const sizeValue = parseInt(this.currentSize);
    
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20">
        <text x="2" y="15" font-size="12" fill="currentColor">A</text>
        <text x="8" y="15" font-size="${Math.min(16, sizeValue)}" fill="currentColor">A</text>
        <text x="16" y="15" font-size="10" fill="currentColor">A</text>
      </svg>
      <span class="size-label">${this.currentSize}</span>
    `;
  }

  applySize(size) {
    this.palette.restoreSelection();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    
    // Создаем временный элемент для хранения выделенного содержимого
    const fragment = range.extractContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);
    
    // Применяем стиль ко всему содержимому
    this._applyStyleToContent(tempDiv, size);
    
    // Вставляем обработанное содержимое обратно
    range.insertNode(tempDiv);
    
    // Перемещаем содержимое из временного div обратно в документ
    while (tempDiv.firstChild) {
      tempDiv.parentNode.insertBefore(tempDiv.firstChild, tempDiv);
    }
    tempDiv.remove();
    
    // Восстанавливаем выделение
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStart(range.startContainer, range.startOffset);
    newRange.setEnd(range.endContainer, range.endOffset);
    selection.addRange(newRange);
    
    // Сохраняем текущий размер
    this.currentSize = size;
    this.updateButtonContent();
  }
  
  /**
   * Получает все элементы, которые будут затронуты изменением
   * @param {Range} range - диапазон выделения
   * @returns {Array} массив элементов
   * @private
   */
  _getAffectedElements(range) {
    const elements = [];
    const container = range.commonAncestorContainer;
    
    if (container.nodeType === Node.ELEMENT_NODE) {
      // Если контейнер - элемент, добавляем все его дочерние элементы в диапазоне
      const nodeIterator = document.createNodeIterator(
        container,
        NodeFilter.SHOW_ELEMENT,
        { acceptNode: (node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
      );
      
      let currentNode;
      while (currentNode = nodeIterator.nextNode()) {
        elements.push(currentNode);
      }
    } else if (container.nodeType === Node.TEXT_NODE) {
      // Если контейнер - текстовый узел, добавляем его родительский элемент
      elements.push(container.parentElement);
    }
    
    return elements;
  }
  
  /**
   * Рекурсивно применяет стиль размера ко всему содержимому
   * @param {HTMLElement} element - элемент, к содержимому которого нужно применить стиль
   * @param {string} size - размер шрифта
   * @private
   */
  _applyStyleToContent(element, size) {
    const nodeIterator = document.createNodeIterator(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
    );
    
    let currentNode;
    const nodesToProcess = [];
    
    // Собираем все узлы
    while (currentNode = nodeIterator.nextNode()) {
      nodesToProcess.push(currentNode);
    }
    
    // Обрабатываем каждый узел
    nodesToProcess.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        // Для текстовых узлов с непустым содержимым
        const parentSpan = node.parentElement?.closest('span[style*="font-size"]');
        if (parentSpan) {
          // Если уже есть span с размером, обновляем его
          parentSpan.style.fontSize = size;
        } else {
          // Иначе создаем новый span
          const span = document.createElement('span');
          span.style.fontSize = size;
          node.parentNode.insertBefore(span, node);
          span.appendChild(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN' && node.style.fontSize) {
        // Для span с заданным размером обновляем размер
        node.style.fontSize = size;
      }
    });
  }

  surround(range) {
    this.applySize(this.currentSize);
  }

  checkState() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const node = selection.getRangeAt(0).startContainer.parentElement;
    const sizedSpan = node?.closest('span[style*="font-size"]');
    
    if (sizedSpan) {
      // Если найден элемент с заданным размером шрифта
      this.currentSize = sizedSpan.style.fontSize;
      this.updateButtonContent();
      return true;
    } else {
      // Если выделение переместилось на текст без заданного размера шрифта,
      // возвращаем размер по умолчанию
      if (this.currentSize !== this.config.defaultSize) {
        this.currentSize = this.config.defaultSize;
        this.updateButtonContent();
      }
      return false;
    }
  }

  static get shortcut() {
    return 'CMD+SHIFT+S';
  }

  destroy() {
    if (this.palette) {
      this.palette.destroy();
    }
  }
}
