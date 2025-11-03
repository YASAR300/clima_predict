import 'dart:async';
import 'package:flutter_reactive_ble/flutter_reactive_ble.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';
import '../models/sensor_reading.dart';
import 'database_service.dart';

class SensorService {
  final FlutterReactiveBle _ble = FlutterReactiveBle();
  final Map<String, StreamSubscription> _subscriptions = {};
  final Map<String, String> _pairedSensors = {}; // deviceId -> name

  Stream<BleStatus> get statusStream => _ble.statusStream;

  Future<bool> requestPermissions() async {
    final location = await Permission.location.request();
    final bluetooth = await Permission.bluetoothScan.request();
    final bluetoothConnect = await Permission.bluetoothConnect.request();

    return location.isGranted &&
        (bluetooth.isGranted || bluetoothConnect.isGranted);
  }

  Future<List<DiscoveredDevice>> scanForSensors({
    Duration timeout = const Duration(seconds: 10),
  }) async {
    if (!await requestPermissions()) {
      throw Exception('Bluetooth permissions not granted');
    }

    final devices = <DiscoveredDevice>[];
    final subscription = _ble.scanForDevices(
      withServices: [],
      scanMode: ScanMode.lowLatency,
      requireLocationServicesEnabled: false,
    ).listen(
      (device) {
        // Filter for sensor-like devices (you can add more filtering)
        if (device.name.toLowerCase().contains('sensor') ||
            device.name.toLowerCase().contains('climate') ||
            device.name.isEmpty) {
          devices.add(device);
        }
      },
      onError: (error) => debugPrint('Scan error: $error'),
    );

    await Future.delayed(timeout);
    await subscription.cancel();

    return devices;
  }

  Future<bool> pairSensor(String deviceId, String customName) async {
    try {
      // In production, establish connection and configure
      _pairedSensors[deviceId] = customName;
      
      // Start listening to sensor data
      await startListening(deviceId);
      
      return true;
    } catch (e) {
      debugPrint('Error pairing sensor: $e');
      return false;
    }
  }

  Future<void> startListening(String deviceId) async {
    if (_subscriptions.containsKey(deviceId)) {
      return; // Already listening
    }

    try {
      // Connect to device - returns a stream, need to wait for connection
      final connectionStream = _ble.connectToDevice(
        id: deviceId,
        connectionTimeout: const Duration(seconds: 5),
      );
      
      await connectionStream.first.timeout(
        const Duration(seconds: 5),
        onTimeout: () => throw TimeoutException('Connection timeout'),
      );

      // Discover services (assume standard BLE UART service)
      // ignore: deprecated_member_use
      final services = await _ble.discoverServices(deviceId);
      final dataService = services.firstWhere(
        (s) => s.serviceId.toString().toLowerCase().contains('fff'),
        orElse: () => services.first,
      );

      // Find characteristic for reading data
      final characteristic = dataService.characteristics.firstWhere(
        (c) => c.characteristicId.toString().isNotEmpty,
        orElse: () => dataService.characteristics.first,
      );

      // Subscribe to notifications or read periodically
      final subscription = _ble.subscribeToCharacteristic(
        QualifiedCharacteristic(
          serviceId: dataService.serviceId,
          characteristicId: characteristic.characteristicId,
          deviceId: deviceId,
        ),
      ).listen(
        (data) {
          _parseAndStoreSensorData(deviceId, data);
        },
        onError: (error) => debugPrint('Sensor read error: $error'),
      );

      _subscriptions[deviceId] = subscription;
    } catch (e) {
      debugPrint('Error starting sensor listener: $e');
    }
  }

  void _parseAndStoreSensorData(String deviceId, List<int> data) {
    try {
      // Parse sensor data format (example: CSV-like format)
      // Format: "temp,humidity,soil_moisture,battery" as bytes
      final dataString = String.fromCharCodes(data);
      final values = dataString.split(',');

      if (values.length >= 4) {
        // Get village from current profile
        final village = 'Anand';

        final reading = SensorReading(
          sensorId: deviceId,
          village: village,
          timestamp: DateTime.now(),
          type: 'temp', // Primary reading
          value: double.tryParse(values[0]) ?? 0.0,
          units: 'C',
          battery: int.tryParse(values[3]) ?? 0,
        );

        DatabaseService.saveSensorReading(reading);

        // Also save humidity if available
        if (values.length > 1) {
          final humidityReading = SensorReading(
            sensorId: deviceId,
            village: village,
            timestamp: DateTime.now(),
            type: 'humidity',
            value: double.tryParse(values[1]) ?? 0.0,
            units: '%',
            battery: int.tryParse(values[3]) ?? 0,
          );
          DatabaseService.saveSensorReading(humidityReading);
        }
      }
    } catch (e) {
      debugPrint('Error parsing sensor data: $e');
    }
  }

  Future<void> stopListening(String deviceId) async {
    final subscription = _subscriptions[deviceId];
    if (subscription != null) {
      await subscription.cancel();
      _subscriptions.remove(deviceId);
    }

    try {
      // Note: disconnectDevice may not be available in all versions
      // The connection will be closed when subscription is cancelled
    } catch (e) {
      debugPrint('Error disconnecting: $e');
    }
  }

  Future<void> disconnectAll() async {
    for (final deviceId in _subscriptions.keys.toList()) {
      await stopListening(deviceId);
    }
  }

  List<String> getPairedSensors() {
    return _pairedSensors.keys.toList();
  }

  String? getSensorName(String deviceId) {
    return _pairedSensors[deviceId];
  }
}

