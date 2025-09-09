// Real-time sync integration for government dashboard
// This script enables real-time updates from the mobile app

class DashboardSync {
    constructor() {
        this.syncKey = 'civicReports';
        this.lastSyncTime = Date.now();
        this.isPolling = false;
    }

    // Initialize real-time sync
    initialize() {
        console.log('🔄 Initializing dashboard sync...');
        
        // Start polling for new reports
        this.startPolling();
        
        // Listen for storage changes (when running in same browser)
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === this.syncKey) {
                    console.log('📡 New reports detected from mobile app');
                    this.handleNewReports();
                }
            });
        }
        
        // Setup periodic sync
        setInterval(() => {
            this.syncReports();
        }, 10000); // Sync every 10 seconds
    }

    // Start polling for new reports
    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        console.log('🔄 Started polling for new reports');
        
        const poll = () => {
            this.checkForNewReports();
            setTimeout(poll, 5000); // Poll every 5 seconds
        };
        
        poll();
    }

    // Check for new reports
    checkForNewReports() {
        try {
            const stored = localStorage.getItem(this.syncKey);
            if (stored) {
                const reports = JSON.parse(stored);
                const newReports = reports.filter(report => 
                    new Date(report.timestamp).getTime() > this.lastSyncTime
                );
                
                if (newReports.length > 0) {
                    console.log(`📥 Found ${newReports.length} new report(s)`);
                    this.handleNewReports(newReports);
                    this.lastSyncTime = Date.now();
                }
            }
        } catch (error) {
            console.error('Error checking for new reports:', error);
        }
    }

    // Handle new reports from mobile app
    handleNewReports(newReports = null) {
        if (typeof window.loadReportsFromStorage === 'function') {
            window.loadReportsFromStorage();
        }
        
        if (newReports && newReports.length > 0) {
            // Show notification for new reports
            newReports.forEach(report => {
                this.showNewReportNotification(report);
            });
            
            // Update dashboard stats
            if (typeof window.updateStats === 'function') {
                window.updateStats();
            }
            
            // Refresh reports display
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
        }
    }

    // Show notification for new report
    showNewReportNotification(report) {
        const message = `🚨 New ${report.priority} priority ${report.category} report: "${report.title}"`;
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        }
        
        // Browser notification (if permission granted)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Civic Report', {
                body: `${report.title} - ${report.location}`,
                icon: '/favicon.ico',
                tag: report.id
            });
        }
    }

    // Sync reports with external services
    async syncReports() {
        try {
            // In production, sync with Firebase or API
            console.log('🔄 Syncing reports...');
            
            // Example Firebase sync:
            /*
            const reports = await db.collection('reports').get();
            const syncedReports = reports.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            localStorage.setItem(this.syncKey, JSON.stringify(syncedReports));
            */
            
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission === 'granted';
        }
        return false;
    }

    // Simulate mobile app report (for testing)
    simulateMobileReport() {
        const mockReport = {
            id: 'report_' + Date.now(),
            title: 'Test Report from Mobile App',
            description: 'This is a test report to demonstrate real-time sync',
            category: 'infrastructure',
            priority: 'medium',
            status: 'pending',
            location: 'Test Location, City',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            user: {
                name: 'Test User',
                email: 'test@example.com',
                phone: '123-456-7890'
            },
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            aiAnalysis: {
                confidence: 0.85,
                tags: ['test', 'demo'],
                estimatedResolutionTime: '2-3 days',
                urgency: 6
            }
        };

        // Add to storage
        const existing = localStorage.getItem(this.syncKey);
        const reports = existing ? JSON.parse(existing) : [];
        reports.push(mockReport);
        localStorage.setItem(this.syncKey, JSON.stringify(reports));

        console.log('📱 Simulated mobile app report:', mockReport);
        this.handleNewReports([mockReport]);
    }
}

// Initialize sync when page loads
const dashboardSync = new DashboardSync();

// Export for global access
window.dashboardSync = dashboardSync;

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    dashboardSync.initialize();
    dashboardSync.requestNotificationPermission();
});

console.log('✅ Dashboard sync integration loaded');