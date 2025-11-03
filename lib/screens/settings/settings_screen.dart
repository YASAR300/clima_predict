import 'package:flutter/material.dart';
import '../../models/farmer_profile.dart';
import '../../services/database_service.dart';
import '../../services/sync_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _offlineMode = false;
  String _selectedLanguage = 'en';
  String _notificationLevel = 'Medium';
  DateTime? _lastUpdated;

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _loadSettings();
  }

  void _loadProfile() {
    final profile = DatabaseService.getFarmerProfile();
    setState(() {
      if (profile != null) {
        _selectedLanguage = profile.language;
      }
    });
  }

  void _loadSettings() {
    // Load settings from SharedPreferences
    // For now, use defaults
    setState(() {
      _lastUpdated = DateTime.now().subtract(const Duration(hours: 2));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: const Color(0xFF2E7D32),
      ),
      body: ListView(
        children: [
          // Offline Mode
          SwitchListTile(
            title: const Text('Offline Mode'),
            subtitle: const Text('Use only cached data'),
            value: _offlineMode,
            onChanged: (value) {
              setState(() {
                _offlineMode = value;
              });
            },
          ),
          const Divider(),

          // Language
          ListTile(
            title: const Text('Language'),
            subtitle: Text(_selectedLanguage == 'en' ? 'English' : 'हिंदी'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Select Language'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      RadioListTile<String>(
                        title: const Text('English'),
                        value: 'en',
                        // ignore: deprecated_member_use
                        groupValue: _selectedLanguage,
                        // ignore: deprecated_member_use
                        onChanged: (value) {
                          setState(() {
                            _selectedLanguage = value!;
                          });
                          Navigator.pop(context);
                        },
                      ),
                      RadioListTile<String>(
                        title: const Text('हिंदी'),
                        value: 'hi',
                        // ignore: deprecated_member_use
                        groupValue: _selectedLanguage,
                        // ignore: deprecated_member_use
                        onChanged: (value) {
                          setState(() {
                            _selectedLanguage = value!;
                          });
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const Divider(),

          // Notifications
          ListTile(
            title: const Text('Notifications'),
            subtitle: Text(_notificationLevel),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Notification Level'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: ['High', 'Medium', 'Low'].map((level) {
                      return RadioListTile<String>(
                        title: Text(level),
                        value: level,
                        // ignore: deprecated_member_use
                        groupValue: _notificationLevel,
                        // ignore: deprecated_member_use
                        onChanged: (value) {
                          setState(() {
                            _notificationLevel = value!;
                          });
                          Navigator.pop(context);
                        },
                      );
                    }).toList(),
                  ),
                ),
              );
            },
          ),
          const Divider(),

          // Update Profile
          ListTile(
            title: const Text('Update Profile'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Navigate to profile update screen
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Profile update coming soon')),
              );
            },
          ),
          const Divider(),

          // Reset Settings
          ListTile(
            title: const Text('Reset Settings'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Reset Settings'),
                  content: const Text(
                      'Are you sure you want to reset all settings to defaults?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        // Reset settings
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Settings reset')),
                        );
                      },
                      child: const Text('Reset'),
                    ),
                  ],
                ),
              );
            },
          ),
          const Divider(),

          // Contact Support
          ListTile(
            title: const Text('Contact Support'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Open support contact
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Support: support@climapredict.org')),
              );
            },
          ),
          const Divider(),

          // Status
          if (_lastUpdated != null)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Last updated: ${_getTimeAgo(_lastUpdated!)} (NASA MODIS)',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ),

          // Sync Now button
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton.icon(
              onPressed: () async {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Syncing...')),
                );
                await SyncService.triggerManualSync();
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sync completed')),
                );
                setState(() {
                  _lastUpdated = DateTime.now();
                });
              },
              icon: const Icon(Icons.sync),
              label: const Text('Sync Now'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                foregroundColor: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inHours < 1) {
      return '${difference.inMinutes} mins ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hrs ago';
    } else {
      return '${difference.inDays} days ago';
    }
  }
}

