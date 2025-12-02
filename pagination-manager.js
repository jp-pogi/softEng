// Pagination Manager for Lists

class PaginationManager {
    constructor(itemsPerPage = 10) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
    }

    paginate(items, page = 1, itemsPerPage = null) {
        const perPage = itemsPerPage || this.itemsPerPage;
        const totalPages = Math.ceil(items.length / perPage);
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        
        return {
            items: items.slice(startIndex, endIndex),
            currentPage: page,
            totalPages: totalPages,
            totalItems: items.length,
            itemsPerPage: perPage,
            startIndex: startIndex + 1,
            endIndex: Math.min(endIndex, items.length),
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    renderPagination(container, paginationData, onPageChange) {
        if (!container) return;

        const { currentPage, totalPages, totalItems, startIndex, endIndex, hasNext, hasPrev } = paginationData;

        if (totalPages <= 1) {
            container.innerHTML = `<div class="pagination-info">Showing ${totalItems} items</div>`;
            return;
        }

        container.innerHTML = `
            <div class="pagination-info">
                Showing ${startIndex}-${endIndex} of ${totalItems} items
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" ${!hasPrev ? 'disabled' : ''} data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <div class="pagination-pages">
                    ${this.generatePageNumbers(currentPage, totalPages).map(page => `
                        <button class="pagination-page ${page === currentPage ? 'active' : ''}" 
                                data-page="${page}">
                            ${page}
                        </button>
                    `).join('')}
                </div>
                <button class="pagination-btn" ${!hasNext ? 'disabled' : ''} data-page="${currentPage + 1}">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="pagination-size">
                <label>Items per page:</label>
                <select class="pagination-size-select">
                    <option value="10" ${this.itemsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${this.itemsPerPage === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${this.itemsPerPage === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${this.itemsPerPage === 100 ? 'selected' : ''}>100</option>
                </select>
            </div>
        `;

        // Add event listeners
        container.querySelectorAll('.pagination-btn, .pagination-page').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.disabled) {
                    const page = parseInt(btn.getAttribute('data-page'));
                    onPageChange(page);
                }
            });
        });

        const sizeSelect = container.querySelector('.pagination-size-select');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                onPageChange(1); // Reset to first page
            });
        }
    }

    generatePageNumbers(currentPage, totalPages) {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }
        
        return pages;
    }
}

// Global pagination manager instance
const paginationManager = new PaginationManager(10);

