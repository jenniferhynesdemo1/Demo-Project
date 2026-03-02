/**
 * System Status Dashboard - Acme Corp
 * Real-time monitoring and status display for core services
 */

// Service Data - In production, this would come from Datadog/PagerDuty APIs
const servicesData = [
    {
        id: 'payment-gateway',
        name: 'Payment Gateway',
        status: 'operational',
        uptime: 99.98,
        responseTime: 145,
        uptimeHistory: generateUptimeHistory(90, 0.998)
    },
    {
        id: 'user-auth',
        name: 'User Authentication',
        status: 'operational',
        uptime: 99.99,
        responseTime: 89,
        uptimeHistory: generateUptimeHistory(90, 0.999)
    },
    {
        id: 'data-sync',
        name: 'Data Sync',
        status: 'degraded',
        uptime: 99.91,
        responseTime: 342,
        uptimeHistory: generateUptimeHistory(90, 0.995)
    },
    {
        id: 'database-cluster',
        name: 'Database Cluster',
        status: 'operational',
        uptime: 99.99,
        responseTime: 23,
        uptimeHistory: generateUptimeHistory(90, 0.999)
    },
    {
        id: 'api-gateway',
        name: 'API Gateway',
        status: 'operational',
        uptime: 99.97,
        responseTime: 67,
        uptimeHistory: generateUptimeHistory(90, 0.998)
    }
];

// Active Incidents Data
const activeIncidents = [
    {
        id: 'inc-001',
        title: 'Data Sync Service Degraded Performance',
        status: 'degraded',
        affectedServices: ['Data Sync'],
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        description: 'We are investigating increased latency in the Data Sync service. Some users may experience slower sync operations.',
        updates: [
            {
                time: new Date(Date.now() - 5 * 60 * 1000),
                text: 'Our engineers have identified the root cause and are implementing a fix.'
            },
            {
                time: new Date(Date.now() - 20 * 60 * 1000),
                text: 'We have identified elevated response times in the Data Sync service.'
            },
            {
                time: new Date(Date.now() - 45 * 60 * 1000),
                text: 'Investigating reports of slow sync operations.'
            }
        ]
    }
];

// Incident History Data
const incidentHistory = [
    {
        id: 'hist-001',
        title: 'Payment Gateway Maintenance',
        status: 'maintenance',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: '2 hours'
    },
    {
        id: 'hist-002',
        title: 'API Gateway Outage',
        status: 'outage',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: '15 minutes'
    },
    {
        id: 'hist-003',
        title: 'Database Cluster Performance Issue',
        status: 'degraded',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        duration: '45 minutes'
    },
    {
        id: 'hist-004',
        title: 'User Authentication Service Update',
        status: 'maintenance',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        duration: '30 minutes'
    }
];

/**
 * Generate random uptime history for visualization
 * @param {number} days - Number of days to generate
 * @param {number} baseUptime - Base uptime probability
 * @returns {Array} Array of status strings for each day
 */
function generateUptimeHistory(days, baseUptime) {
    const history = [];
    const statuses = ['operational', 'degraded', 'outage', 'maintenance'];

    for (let i = 0; i < days; i++) {
        const rand = Math.random();
        if (rand < baseUptime) {
            history.push('operational');
        } else if (rand < baseUptime + 0.003) {
            history.push('degraded');
        } else if (rand < baseUptime + 0.005) {
            history.push('outage');
        } else {
            history.push('maintenance');
        }
    }
    return history;
}

/**
 * Format time for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format relative time
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

/**
 * Get status label from status code
 * @param {string} status - Status code
 * @returns {string} Human readable status label
 */
function getStatusLabel(status) {
    const labels = {
        operational: 'Operational',
        degraded: 'Degraded',
        outage: 'Outage',
        maintenance: 'Maintenance'
    };
    return labels[status] || status;
}

/**
 * Calculate overall system status based on services
 * @returns {object} Overall status object
 */
function calculateOverallStatus() {
    const hasOutage = servicesData.some(s => s.status === 'outage');
    const hasDegraded = servicesData.some(s => s.status === 'degraded');
    const hasMaintenance = servicesData.some(s => s.status === 'maintenance');

    if (hasOutage) {
        return {
            status: 'outage',
            title: 'System Outage',
            description: 'One or more services are experiencing an outage'
        };
    } else if (hasDegraded) {
        return {
            status: 'degraded',
            title: 'Partial System Degradation',
            description: 'Some services are experiencing degraded performance'
        };
    } else if (hasMaintenance) {
        return {
            status: 'maintenance',
            title: 'Scheduled Maintenance',
            description: 'Some services are undergoing maintenance'
        };
    } else {
        return {
            status: 'operational',
            title: 'All Systems Operational',
            description: 'All services are operating normally'
        };
    }
}

/**
 * Render the overall status banner
 */
function renderStatusBanner() {
    const overall = calculateOverallStatus();
    const banner = document.getElementById('statusBanner');
    const title = document.getElementById('overallStatusTitle');
    const desc = document.getElementById('overallStatusDesc');
    const indicator = document.getElementById('overallStatusIndicator');
    const lastUpdated = document.getElementById('lastUpdated');

    // Remove all status classes and add current
    banner.className = 'status-banner';
    if (overall.status !== 'operational') {
        banner.classList.add(overall.status);
    }

    title.textContent = overall.title;
    lastUpdated.textContent = formatTime(new Date());

    // Update icon based on status
    const icons = {
        operational: `<svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`,
        degraded: `<svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`,
        outage: `<svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`,
        maintenance: `<svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>`
    };

    indicator.innerHTML = icons[overall.status];
}

/**
 * Render service cards
 */
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = servicesData.map(service => `
        <div class="service-card" data-service-id="${service.id}">
            <div class="service-header">
                <span class="service-name">${service.name}</span>
                <span class="status-badge ${service.status}">
                    <span class="status-dot"></span>
                    ${getStatusLabel(service.status)}
                </span>
            </div>
            <div class="service-metrics">
                <div class="metric">
                    <div class="metric-label">Uptime (30d)</div>
                    <div class="metric-value ${service.uptime >= 99.9 ? 'good' : ''}">${service.uptime.toFixed(2)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Response Time</div>
                    <div class="metric-value">${service.responseTime}ms</div>
                </div>
            </div>
            <div class="uptime-chart" title="90-day uptime history">
                ${service.uptimeHistory.map((day, idx) => `
                    <div class="uptime-day ${day}" title="Day ${idx + 1}: ${getStatusLabel(day)}"></div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Render uptime metrics grid
 */
function renderUptimeGrid() {
    const grid = document.getElementById('uptimeGrid');
    grid.innerHTML = servicesData.map(service => `
        <div class="uptime-card">
            <div class="uptime-card-header">
                <span class="uptime-card-name">${service.name}</span>
                <span class="uptime-percentage">${service.uptime.toFixed(2)}%</span>
            </div>
            <div class="uptime-chart">
                ${service.uptimeHistory.slice(-30).map((day, idx) => `
                    <div class="uptime-day ${day}" title="Day ${idx + 1}: ${getStatusLabel(day)}"></div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * Render active incidents
 */
function renderActiveIncidents() {
    const container = document.getElementById('activeIncidentsList');
    const section = document.getElementById('activeIncidentsSection');

    if (activeIncidents.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    container.innerHTML = activeIncidents.map(incident => `
        <div class="incident-card ${incident.status}">
            <div class="incident-header">
                <span class="incident-title">${incident.title}</span>
                <span class="incident-time">Started ${formatRelativeTime(incident.startTime)}</span>
            </div>
            <p class="incident-description">${incident.description}</p>
            <div class="incident-timeline">
                <button class="incident-toggle" data-incident-id="${incident.id}" aria-expanded="false">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    View Timeline
                </button>
                <div class="timeline-events" id="timeline-${incident.id}">
                    ${incident.updates.map(update => `
                        <div class="timeline-event">
                            <div class="timeline-event-time">${formatTime(update.time)}</div>
                            <div class="timeline-event-text">${update.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Add toggle event listeners
    document.querySelectorAll('.incident-toggle').forEach(btn => {
        btn.addEventListener('click', toggleTimeline);
    });
}

/**
 * Toggle incident timeline visibility
 * @param {Event} event - Click event
 */
function toggleTimeline(event) {
    const btn = event.currentTarget;
    const incidentId = btn.dataset.incidentId;
    const timeline = document.getElementById(`timeline-${incidentId}`);
    const isExpanded = btn.classList.contains('expanded');

    btn.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', !isExpanded);
    timeline.classList.toggle('visible');
    btn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        ${isExpanded ? 'View Timeline' : 'Hide Timeline'}
    `;
}

/**
 * Render incident history
 */
function renderIncidentHistory() {
    const container = document.getElementById('historyList');

    if (incidentHistory.length === 0) {
        container.innerHTML = `
            <div class="no-incidents">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>No incidents in the past 90 days</p>
            </div>
        `;
        return;
    }

    container.innerHTML = incidentHistory.map(incident => `
        <div class="history-item">
            <div class="history-info">
                <span class="history-date">${formatDate(incident.date)}</span>
                <span class="status-badge ${incident.status}">
                    <span class="status-dot"></span>
                    ${getStatusLabel(incident.status)}
                </span>
                <span class="history-title">${incident.title}</span>
            </div>
            <span class="history-duration">Duration: ${incident.duration}</span>
        </div>
    `).join('');
}

/**
 * Handle refresh button click
 */
function handleRefresh() {
    const btn = document.getElementById('refreshBtn');
    const icon = btn.querySelector('.icon');

    // Add spinning animation
    icon.classList.add('spinner');
    btn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        // Re-render all components
        renderStatusBanner();
        renderServices();
        renderUptimeGrid();
        renderActiveIncidents();
        renderIncidentHistory();

        // Remove spinning animation
        icon.classList.remove('spinner');
        btn.disabled = false;
    }, 1000);
}

/**
 * Handle subscribe modal
 */
function setupSubscribeModal() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const modal = document.getElementById('subscribeModal');
    const backdrop = document.getElementById('modalBackdrop');
    const cancelBtn = document.getElementById('cancelSubscribe');
    const form = document.getElementById('subscribeForm');

    const openModal = () => modal.classList.add('visible');
    const closeModal = () => modal.classList.remove('visible');

    subscribeBtn.addEventListener('click', openModal);
    backdrop.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        // In production, this would send to an API
        console.log('Subscribing:', email);
        alert(`Successfully subscribed ${email} to status updates!`);
        form.reset();
        closeModal();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });
}

/**
 * Initialize the dashboard
 */
function init() {
    renderStatusBanner();
    renderServices();
    renderUptimeGrid();
    renderActiveIncidents();
    renderIncidentHistory();
    setupSubscribeModal();

    // Setup refresh button
    document.getElementById('refreshBtn').addEventListener('click', handleRefresh);

    // Auto-refresh every 60 seconds
    setInterval(() => {
        renderStatusBanner();
    }, 60000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
