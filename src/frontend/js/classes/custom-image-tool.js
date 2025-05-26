import ImageTool from '@editorjs/image';

export default class CustomImageTool extends ImageTool {
  static get toolbox() {
    return ImageTool.toolbox; // Возвращаем стандартную иконку
  }

  constructor({ data, api, config }) {
    super({ data, api, config });
    this.alignment = data.alignment || 'center';
    this.width = data.width || '100%';
  }

  render() {
    const container = super.render();
    this._container = container;

    // Добавляем обработчики после полного рендера
    setTimeout(() => {
      const wrapper = container.querySelector('.cdx-image');
      if (wrapper) {
        this._applyStyles(wrapper);
        this._addControls(wrapper);
      }
    }, 100);

    return container;
  }

  _applyStyles(wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.width = 'fit-content';
    wrapper.style.margin = this._getAlignmentMargin();
    
    const img = wrapper.querySelector('img');
    if (img) {
      img.style.width = this.width;
      img.style.height = 'auto';
    }
  }

  _getAlignmentMargin() {
    switch(this.alignment) {
      case 'left': return '0 auto 0 0';
      case 'right': return '0 0 0 auto';
      default: return '0 auto';
    }
  }

  _addControls(wrapper) {
    // Добавляем кнопки выравнивания
    const alignControls = document.createElement('div');
    alignControls.className = 'image-align-controls';
    
    ['left', 'center', 'right'].forEach(align => {
      const btn = document.createElement('button');
      btn.innerHTML = this._getAlignmentIcon(align);
      btn.dataset.align = align;
      btn.classList.toggle('active', this.alignment === align);
      
      btn.addEventListener('click', () => {
        this.alignment = align;
        wrapper.style.margin = this._getAlignmentMargin();
        alignControls.querySelectorAll('button').forEach(b => {
          b.classList.toggle('active', b.dataset.align === align);
        });
      });
      
      alignControls.appendChild(btn);
    });

    // Добавляем ручку ресайза
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'image-resize-handle';
    resizeHandle.innerHTML = '↔';
    
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const img = wrapper.querySelector('img');
      if (img) this._initResize(img, e);
    });

    wrapper.appendChild(alignControls);
    wrapper.appendChild(resizeHandle);
  }

  _initResize(element, startEvent) {
    const startWidth = parseInt(element.style.width) || element.offsetWidth;
    const startX = startEvent.clientX;
    const maxWidth = this._container.offsetWidth;

    const doResize = (e) => {
      const newWidth = Math.max(200, Math.min(startWidth + (e.clientX - startX), maxWidth));
      element.style.width = `${newWidth}px`;
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
      this.width = element.style.width;
    };

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize, { once: true });
  }

  save(blockContent) {
    const savedData = super.save(blockContent);
    return {
      ...savedData,
      width: this.width,
      alignment: this.alignment
    };
  }

  _getAlignmentIcon(align) {
    const icons = {
      left: '⎸',
      center: '⎸⎹',
      right: ' |'
    };
    return icons[align] || '';
  }


}