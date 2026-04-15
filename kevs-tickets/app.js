// Kev's Tickets - Lightweight Ticket Management App

class TicketManager {
    constructor() {
        this.tickets = this.loadTickets();
        this.currentTicketId = null;
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        // Buttons
        this.newTicketBtn = document.getElementById('newTicketBtn');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeViewModalBtn = document.getElementById('closeViewModal');
        this.editTicketBtn = document.getElementById('editTicketBtn');
        this.deleteTicketBtn = document.getElementById('deleteTicketBtn');

        // Modals
        this.ticketModal = document.getElementById('ticketModal');
        this.viewModal = document.getElementById('viewModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.viewTitle = document.getElementById('viewTitle');
        this.viewContent = document.getElementById('viewContent');

        // Form
        this.ticketForm = document.getElementById('ticketForm');
        this.ticketIdInput = document.getElementById('ticketId');
        this.ticketTitleInput = document.getElementById('ticketTitle');
        this.ticketDescriptionInput = document.getElementById('ticketDescription');
        this.ticketStatusInput = document.getElementById('ticketStatus');
        this.ticketPriorityInput = document.getElementById('ticketPriority');
        this.ticketAssigneeInput = document.getElementById('ticketAssignee');

        // Filters
        this.statusFilter = document.getElementById('statusFilter');
        this.priorityFilter = document.getElementById('priorityFilter');

        // Container
        this.ticketsContainer = document.getElementById('ticketsContainer');

        // Stats
        this.totalCount = document.getElementById('totalCount');
        this.openCount = document.getElementById('openCount');
        this.inProgressCount = document.getElementById('inProgressCount');
        this.resolvedCount = document.getElementById('resolvedCount');
    }

    bindEvents() {
        // New ticket button
        this.newTicketBtn.addEventListener('click', () => this.openNewTicketModal());

        // Close modals
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.closeViewModalBtn.addEventListener('click', () => this.closeViewModal());

        // Form submission
        this.ticketForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Edit and delete from view modal
        this.editTicketBtn.addEventListener('click', () => this.editCurrentTicket());
        this.deleteTicketBtn.addEventListener('click', () => this.deleteCurrentTicket());

        // Filters
        this.statusFilter.addEventListener('change', () => this.render());
        this.priorityFilter.addEventListener('change', () => this.render());

        // Close modal on outside click
        this.ticketModal.addEventListener('click', (e) => {
            if (e.target === this.ticketModal) this.closeModal();
        });
        this.viewModal.addEventListener('click', (e) => {
            if (e.target === this.viewModal) this.closeViewModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeViewModal();
            }
            if (e.key === 'n' && !this.isModalOpen()) {
                e.preventDefault();
                this.openNewTicketModal();
            }
        });
    }

    isModalOpen() {
        return this.ticketModal.classList.contains('active') ||
               this.viewModal.classList.contains('active');
    }

    loadTickets() {
        const stored = localStorage.getItem('kevs-tickets');
        return stored ? JSON.parse(stored) : [];
    }

    saveTickets() {
        localStorage.setItem('kevs-tickets', JSON.stringify(this.tickets));
    }

    generateId() {
        return 'TKT-' + Date.now().toString(36).toUpperCase();
    }

    openNewTicketModal() {
        this.modalTitle.textContent = 'New Ticket';
        this.ticketForm.reset();
        this.ticketIdInput.value = '';
        this.ticketStatusInput.value = 'open';
        this.ticketPriorityInput.value = 'medium';
        this.ticketModal.classList.add('active');
        this.ticketTitleInput.focus();
    }

    openEditModal(ticket) {
        this.modalTitle.textContent = 'Edit Ticket';
        this.ticketIdInput.value = ticket.id;
        this.ticketTitleInput.value = ticket.title;
        this.ticketDescriptionInput.value = ticket.description || '';
        this.ticketStatusInput.value = ticket.status;
        this.ticketPriorityInput.value = ticket.priority;
        this.ticketAssigneeInput.value = ticket.assignee || '';
        this.closeViewModal();
        this.ticketModal.classList.add('active');
        this.ticketTitleInput.focus();
    }

    closeModal() {
        this.ticketModal.classList.remove('active');
    }

    openViewModal(ticket) {
        this.currentTicketId = ticket.id;
        this.viewTitle.textContent = ticket.title;

        const statusClass = ticket.status;
        const priorityClass = ticket.priority;

        this.viewContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Ticket ID</div>
                <div class="detail-value" style="font-family: monospace;">${ticket.id}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="badge badge-status ${statusClass}">${this.formatStatus(ticket.status)}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Priority</div>
                <div class="detail-value">
                    <span class="badge badge-priority ${priorityClass}">${ticket.priority}</span>
                </div>
            </div>
            ${ticket.assignee ? `
            <div class="detail-row">
                <div class="detail-label">Assignee</div>
                <div class="detail-value">${this.escapeHtml(ticket.assignee)}</div>
            </div>
            ` : ''}
            <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${ticket.description ? this.escapeHtml(ticket.description) : '<em style="color: var(--text-muted);">No description</em>'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Created</div>
                <div class="detail-value">${this.formatDate(ticket.createdAt)}</div>
            </div>
            ${ticket.updatedAt !== ticket.createdAt ? `
            <div class="detail-row">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">${this.formatDate(ticket.updatedAt)}</div>
            </div>
            ` : ''}
        `;

        this.viewModal.classList.add('active');
    }

    closeViewModal() {
        this.viewModal.classList.remove('active');
        this.currentTicketId = null;
    }

    editCurrentTicket() {
        const ticket = this.tickets.find(t => t.id === this.currentTicketId);
        if (ticket) {
            this.openEditModal(ticket);
        }
    }

    deleteCurrentTicket() {
        if (confirm('Are you sure you want to delete this ticket?')) {
            this.tickets = this.tickets.filter(t => t.id !== this.currentTicketId);
            this.saveTickets();
            this.closeViewModal();
            this.render();
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const ticketData = {
            title: this.ticketTitleInput.value.trim(),
            description: this.ticketDescriptionInput.value.trim(),
            status: this.ticketStatusInput.value,
            priority: this.ticketPriorityInput.value,
            assignee: this.ticketAssigneeInput.value.trim()
        };

        if (this.ticketIdInput.value) {
            // Update existing ticket
            const index = this.tickets.findIndex(t => t.id === this.ticketIdInput.value);
            if (index !== -1) {
                this.tickets[index] = {
                    ...this.tickets[index],
                    ...ticketData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new ticket
            const newTicket = {
                id: this.generateId(),
                ...ticketData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.tickets.unshift(newTicket);
        }

        this.saveTickets();
        this.closeModal();
        this.render();
    }

    getFilteredTickets() {
        let filtered = [...this.tickets];

        const statusValue = this.statusFilter.value;
        if (statusValue !== 'all') {
            filtered = filtered.filter(t => t.status === statusValue);
        }

        const priorityValue = this.priorityFilter.value;
        if (priorityValue !== 'all') {
            filtered = filtered.filter(t => t.priority === priorityValue);
        }

        return filtered;
    }

    updateStats() {
        this.totalCount.textContent = this.tickets.length;
        this.openCount.textContent = this.tickets.filter(t => t.status === 'open').length;
        this.inProgressCount.textContent = this.tickets.filter(t => t.status === 'in-progress').length;
        this.resolvedCount.textContent = this.tickets.filter(t => t.status === 'resolved').length;
    }

    formatStatus(status) {
        return status.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderTicketCard(ticket) {
        const card = document.createElement('div');
        card.className = `ticket-card status-${ticket.status}`;
        card.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-title">${this.escapeHtml(ticket.title)}</span>
                <span class="ticket-id">${ticket.id}</span>
            </div>
            ${ticket.description ? `<p class="ticket-description">${this.escapeHtml(ticket.description)}</p>` : ''}
            <div class="ticket-meta">
                <span class="badge badge-status ${ticket.status}">${this.formatStatus(ticket.status)}</span>
                <span class="badge badge-priority ${ticket.priority}">${ticket.priority}</span>
                ${ticket.assignee ? `<span class="ticket-assignee">${this.escapeHtml(ticket.assignee)}</span>` : ''}
                <span class="ticket-date">${this.formatDate(ticket.createdAt)}</span>
            </div>
        `;

        card.addEventListener('click', () => this.openViewModal(ticket));
        return card;
    }

    render() {
        this.updateStats();

        const filtered = this.getFilteredTickets();
        this.ticketsContainer.innerHTML = '';

        if (filtered.length === 0) {
            const emptyMsg = this.tickets.length === 0
                ? 'No tickets yet. Create one to get started!'
                : 'No tickets match your filters.';
            this.ticketsContainer.innerHTML = `<p class="empty-state">${emptyMsg}</p>`;
            return;
        }

        filtered.forEach(ticket => {
            this.ticketsContainer.appendChild(this.renderTicketCard(ticket));
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.ticketManager = new TicketManager();
});
