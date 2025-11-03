import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../models/farmer_profile.dart';
import '../../services/database_service.dart';
import '../main/home_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _villageController = TextEditingController();
  final _nameController = TextEditingController();
  final List<String> _selectedCrops = [];
  String _selectedLanguage = 'en';
  String? _selectedBlock;
  String? _selectedDistrict;
  String? _selectedState;

  final List<String> _crops = ['Wheat', 'Rice'];
  final List<String> languages = ['English', 'हिंदी'];

  @override
  void dispose() {
    _villageController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _requestPermissions() async {
    // Request location, notifications, and Bluetooth permissions
    // Implementation would use permission_handler
    // For now, proceed to home
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedCrops.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select at least one crop')),
        );
        return;
      }

      final profile = FarmerProfile(
        id: const Uuid().v4(),
        name: _nameController.text.trim(),
        village: _villageController.text.trim(),
        block: _selectedBlock ?? 'Anand Block',
        district: _selectedDistrict ?? 'Anand',
        state: _selectedState ?? 'Gujarat',
        crops: _selectedCrops.map((c) => c.toLowerCase()).toList(),
        language: _selectedLanguage,
        createdAt: DateTime.now(),
      );

      await DatabaseService.saveFarmerProfile(profile);
      await _requestPermissions();

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile Setup'),
        backgroundColor: const Color(0xFF2E7D32),
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(24.0),
            children: [
              const Text(
                'Village name',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _villageController,
                decoration: const InputDecoration(
                  hintText: 'Enter village name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter village name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              const Text(
                'Your name',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  hintText: 'Enter your name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              const Text(
                'Select crop(s)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._crops.map((crop) => CheckboxListTile(
                    title: Text(crop),
                    value: _selectedCrops.contains(crop),
                    onChanged: (value) {
                      setState(() {
                        if (value == true) {
                          _selectedCrops.add(crop);
                        } else {
                          _selectedCrops.remove(crop);
                        }
                      });
                    },
                  )),
              const SizedBox(height: 24),
              const Text(
                'Language',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...['en', 'hi'].map((lang) => RadioListTile<String>(
                    title: Text(lang == 'en' ? 'English' : 'हिंदी'),
                    value: lang,
                    // ignore: deprecated_member_use
                    groupValue: _selectedLanguage,
                    // ignore: deprecated_member_use
                    onChanged: (value) {
                      setState(() {
                        _selectedLanguage = value!;
                      });
                    },
                  )),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2E7D32),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Continue',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

