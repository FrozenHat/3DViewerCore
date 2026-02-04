import { PartMetadata } from '../types';

export class DetailCard {
    private container: HTMLElement;
    private isVisible: boolean = false;
    private onClose?: () => void;
    private onIsolate?: (groupId: string) => void;

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Контейнер ${containerId} не найден!`);
            throw new Error(`Container ${containerId} not found`);
        }
        this.container = container;
        console.log(`✅ DetailCard: контейнер найден:`, containerId);
        this.createUI();
        console.log(`✅ DetailCard: UI создан`);
    }

    private createUI(): void {
        this.container.innerHTML = `
            <div id="detail-card" class="detail-card hidden">
                <div class="card-header">
                    <h3 id="part-name">—</h3>
                    <button id="close-card" class="btn-close">✕</button>
                </div>
                <div class="card-body">
                    <p id="part-description">—</p>
                    <div class="metadata">
                        <h4>Метаданные</h4>
                        <ul id="metadata-list"></ul>
                    </div>
                    <div class="documentation">
                        <h4>Документация</h4>
                        <ul id="doc-links"></ul>
                    </div>
                    <button id="isolate-btn" class="btn-isolate">🔍 Изолировать группу</button>
                </div>
            </div>
        `;

        console.log('✅ HTML карточки вставлен в DOM');
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        const closeBtn = this.container.querySelector('#close-card');
        closeBtn?.addEventListener('click', () => {
            this.hide();
        });

        const isolateBtn = this.container.querySelector('#isolate-btn');
        isolateBtn?.addEventListener('click', () => {
            const card = this.container.querySelector('#detail-card');
            const groupId = card?.getAttribute('data-group-id');
            if (groupId && this.onIsolate) {
                this.onIsolate(groupId);
            }
        });
    }

    public show(metadata: PartMetadata): void {
        console.log('📋 DetailCard.show() вызван с:', metadata);
        
        const card = this.container.querySelector('#detail-card');
        const nameEl = this.container.querySelector('#part-name');
        const descEl = this.container.querySelector('#part-description');
        const metadataList = this.container.querySelector('#metadata-list');
        const docLinks = this.container.querySelector('#doc-links');

        console.log('📋 Элементы карточки:', {
            card: !!card,
            nameEl: !!nameEl,
            descEl: !!descEl,
            metadataList: !!metadataList,
            docLinks: !!docLinks
        });

        if (nameEl) nameEl.textContent = metadata.name;
        if (descEl) descEl.textContent = metadata.description;

        // Метаданные
        if (metadataList) {
            metadataList.innerHTML = '';
            if (metadata.material) {
                metadataList.innerHTML += `<li><strong>Материал:</strong> ${metadata.material}</li>`;
            }
            if (metadata.dimensions) {
                const d = metadata.dimensions;
                metadataList.innerHTML += `<li><strong>Размеры:</strong> ${d.width}×${d.height}×${d.depth} мм</li>`;
            }
            if (metadata.weight) {
                metadataList.innerHTML += `<li><strong>Вес:</strong> ${metadata.weight} кг</li>`;
            }
        }

        // Документация
        if (docLinks && metadata.documentation) {
            docLinks.innerHTML = '';
            metadata.documentation.forEach(link => {
                docLinks.innerHTML += `<li><a href="${link}" target="_blank">${link}</a></li>`;
            });
        }

        if (card) {
            card.classList.remove('hidden');
            if (metadata.groupId) {
                card.setAttribute('data-group-id', metadata.groupId);
            }
            console.log('✅ Карточка открыта, hidden удален');
        } else {
            console.error('❌ Элемент #detail-card не найден!');
        }

        this.isVisible = true;
    }

    public hide(): void {
        const card = this.container.querySelector('#detail-card');
        card?.classList.add('hidden');
        this.isVisible = false;

        console.log('📋 Карточка закрыта');

        if (this.onClose) {
            this.onClose();
        }
    }

    public onCloseCard(callback: () => void): void {
        this.onClose = callback;
    }

    public onIsolateGroup(callback: (groupId: string) => void): void {
        this.onIsolate = callback;
    }
}