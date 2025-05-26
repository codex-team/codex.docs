export default class VideoTool {
  static get toolbox() {
    return {
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.25 3.75H3.75C2.36929 3.75 1.25 4.86929 1.25 6.25V13.75C1.25 15.1307 2.36929 16.25 3.75 16.25H16.25C17.6307 16.25 18.75 15.1307 18.75 13.75V6.25C18.75 4.86929 17.6307 3.75 16.25 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M8.125 6.875L13.125 10L8.125 13.125V6.875Z" fill="currentColor"/></svg>`,
      title: 'Video',
    };
  }

  constructor({ data, api, config }) {
    this.data = data || {};
    this.api = api;
    this.config = config || {};
    this.wrapper = null;
    this.alignment = data.alignment || 'center';
    this.width = data.width || '100%';

    // Привязываем контекст для обработчиков
    this._handleFileUpload = this._handleFileUpload.bind(this);
    this._initResize = this._initResize.bind(this);
    this._handleUrlSubmit = this._handleUrlSubmit.bind(this); // Added this binding
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('video-tool');

    if (this.data.url) {
      this._createVideoElement(this.data.url, this.data.caption || '');
    } else {
      this._createUploadForm();
    }

    return this.wrapper;
  }

  _createUploadForm() {
    this.wrapper.innerHTML = `
      <div class="video-upload-tabs">
        <div class="tabs-header">
          <button class="tab-button active" data-tab="upload">Upload</button>
          <button class="tab-button" data-tab="embed">Embed URL</button>
        </div>
        <div class="tab-content active" data-tab="Загрузить с ПК">
          <label class="video-upload-button">
            <input type="file" accept="video/mp4,video/webm,video/ogg" class="video-file-input">
            <span>Select Video File</span>
          </label>
        </div>
        <div class="tab-content" data-tab="Вставить ссылку">
          <div class="embed-form">
            <select class="embed-service">
              <option value="youtube">YouTube</option>
              <option value="rutube">Rutube</option>
            </select>
            <input type="text" class="embed-url" placeholder="Paste video URL...">
            <button class="embed-submit">Вставить видео</button>
          </div>
        </div>
      </div>
    `;
// Tab switching
    this.wrapper.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.wrapper.querySelectorAll('.tab-button, .tab-content').forEach(el => {
          el.classList.toggle('active', el.dataset.tab === btn.dataset.tab);
        });
      });
    });

    // File upload handler
    this.wrapper.querySelector('.video-file-input')
      .addEventListener('change', this._handleFileUpload);

    // URL embed handler
    this.wrapper.querySelector('.embed-submit')
      .addEventListener('click', this._handleUrlSubmit);
  }

  async _handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.config.uploader || !this.config.uploader.byFile) {
      this._showError('File upload is not configured');
      return;
    }

    try {
      const url = await this._uploadFile(file);
      this.type = 'file';
      this.data = { url, type: 'file' };
      his._createVideoElement(url, '');
    } catch (error) {
      this._showError('File upload failed: ' + error.message);
    }
  }

  _handleUrlSubmit() {
    const wrapper = this.wrapper; // Store reference to wrapper
    const service = wrapper.querySelector('.embed-service').value;
    const url = wrapper.querySelector('.embed-url').value.trim();

    if (!url) {
      this._showError('Please enter a valid URL');
      return;
    }

    try {
      const embedUrl = this._parseEmbedUrl(service, url);
      this.type = service;
      this.data = { url: embedUrl, type: service };
      this._createVideoElement(embedUrl, '');
    } catch (error) {
      this._showError('Invalid video URL: ' + error.message);
    }
  }

  _parseEmbedUrl(service, url) {
    // YouTube
    if (service === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    
    // Rutube
    if (service === 'rutube') {
      const regExp = /rutube\.ru\/video\/([a-z0-9]+)/i;
      const match = url.match(regExp);
      if (match && match[1]) {
        return `https://rutube.ru/play/embed/${match[1]}`;
      }
    }
    
    throw new Error('Invalid URL');
  }

  _createVideoElement() {
    this.wrapper.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'video-container';
    container.style.margin = this._getAlignmentMargin();
    container.style.width = this.width;

    if (this.type === 'file') {
      const video = document.createElement('video');
      video.src = this.data.url;
      video.controls = true;
      video.style.width = '100%';
      container.appendChild(video);
    } 
    else if (this.type === 'youtube' || this.type === 'rutube') {
      const iframe = document.createElement('iframe');
      iframe.src = this.data.url;
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '400px';
      container.appendChild(iframe);
    }

    this._addResizeHandle(container);
    this._addCaption(container);
    this.wrapper.appendChild(container);
  }

  async _uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(this.config.uploader.byFile, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return data.file.url;
  }

  _addResizeHandle() {
    const container = this.wrapper.querySelector('.video-container');
    const video = container.querySelector('video');
    
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.innerHTML = '↔';
    handle.addEventListener('mousedown', this._initResize);
    
    container.appendChild(handle);
  }

  _initResize(e) {
    e.preventDefault();
    const video = this.wrapper.querySelector('video');
    const startWidth = parseInt(video.style.width) || video.offsetWidth;
    const startX = e.clientX;

    const doResize = (e) => {
      const newWidth = Math.max(200, startWidth + (e.clientX - startX));
      video.style.width = `${newWidth}px`;
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
      this.width = video.style.width;
    };

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize, { once: true });
  }

  save(blockContent) {
    const video = blockContent.querySelector('video');
    const caption = blockContent.querySelector('.video-caption');
    
    return {
      url: video?.src || '',
      caption: caption?.innerHTML || '',
      width: video?.style.width || '100%',
      alignment: this.alignment
    };
  }

  _getAlignmentMargin() {
    switch(this.alignment) {
      case 'left': return '0 auto 0 0';
      case 'right': return '0 0 0 auto';
      default: return '0 auto';
    }
  }

  _showError(message) {
    this.wrapper.innerHTML = `<div class="video-error">${message}</div>`;
  }
}