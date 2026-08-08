# HolyWay 🤎

### A church discovery platform built with React Native and Firebase

HolyWay is a cross-platform mobile application designed to make it easier for people to discover churches based on **location, denomination, language, worship timings, church type, and personal preferences**.

The project started from a very personal problem and gradually evolved into my first complete mobile application.
<img width="1280" height="1706" alt="holyway1" src="https://github.com/user-attachments/assets/5059f8a4-5fac-4a37-a62e-c76cec76c903" />
<img width="1280" height="1705" alt="holyway2" src="https://github.com/user-attachments/assets/dbae209e-5c79-412b-9925-f6775618991a" />
<img width="1280" height="1705" alt="holyway3" src="https://github.com/user-attachments/assets/83e0058e-bef0-4dad-bcfd-5d6a44b917c7" />
<img width="1280" height="1705" alt="holyway4" src="https://github.com/user-attachments/assets/84a39e92-c6a5-4a5e-af84-fa91feb2e646" />
<img width="1280" height="1706" alt="holyway5" src="https://github.com/user-attachments/assets/8eed1b72-77b0-4eff-9ba4-809b30599d21" />
<img width="1280" height="1706" alt="holyway6" src="https://github.com/user-attachments/assets/c7b3773c-9908-4257-bb99-b296326014a3" />


### Android APK

A testable Android APK is available through the GitHub Release.

### Download

Download HolyWay v1.0.0

The APK is currently distributed as an Android release while the application continues to evolve.

###  How to Install:
### Android
1. Open the HolyWay v1.0.0 GitHub Release.
2. Download the .apk file from the Assets section.
3. Open the downloaded APK on an Android device.
4. If Android asks for permission to install from an unknown source, allow the browser/file manager to install the application.
5. Install and open HolyWay.
6. And continue by signing up, or as a guest! :)

The application requires an internet connection for retrieving the latest church information from Firebase.

### Application Demo🎥

A short walkthrough video demonstrating HolyWay's interface and core functionality is included below.

<!-- Add your video/GIF/embed here -->

HolyWay App Walkthrough

### The video demonstrates:

Church discovery
Search
Filtering
Church details
Mass/service timings
Favorites
Location and Maps integration
User preferences
Feasts & Events
Profile and personalization

## 📱 The Problem

When I first came to Hyderabad for my B.Tech, one of the challenges I faced was finding a church that actually suited my needs.

At first, it seemed simple:

> "Google Maps exists. Just search for a church."

But churches are different from ordinary places on a map.

Knowing where a church is located is only part of the problem. People also need to know:

- Which denomination is the church?
- What languages are used during worship?
- What are the Mass or service timings?
- Is there a service today?
- What type of church is it?
- Is it nearby?
- Who is the parish priest?
- Are there feast celebrations or special events?
- Does this church fit the user's worship preferences?

This becomes even more complicated in a diverse city like Hyderabad, where Catholic, Methodist, Baptist, Pentecostal, CSI and other Christian communities coexist.

I wanted to build something that goes beyond simply showing a church's location.

---

# 🎯 Purpose

HolyWay aims to make church discovery more useful by bringing the information people actually need into one place.

Instead of searching across maps, websites, social media pages and individual church sources, users can discover churches through a single mobile application.

The goal is simple:

> **Help people find a church that fits their location, denomination, language and worship preferences.**

The application is particularly intended to be useful for:

- Students moving to a new city
- Migrants and working professionals
- Families looking for nearby churches
- People exploring different Christian denominations
- Anyone looking for a church community in an unfamiliar location

---

# 💡 How HolyWay Solves the Problem:

HolyWay combines several pieces of information that are normally scattered across different sources.

### 1. Church Discovery

Users can browse and search through churches available in the database.

### 2. Location-Based Discovery

Users can discover churches based on their current location and view their locations through Google Maps.

### 3. Denomination Filtering

Churches can be filtered according to denomination, including Catholic, Methodist and other Christian denominations represented in the database.

### 4. Language-Based Discovery

Users can explore churches based on worship languages such as:

- English
- Telugu
- Tamil
- Malayalam
- Hindi
- Other supported languages

### 🕐 Mass & Service Timings

Church-specific schedules are stored and displayed so users can determine when services are available.

### ❤️ Favorites & Personalization

Users can save churches and maintain preferences for denomination and language.

### 🎉 Feasts & Events

The application also provides a dedicated space for church-related feasts, celebrations and events.

### 🗺️ Google Maps Integration

Users can open church locations directly through Google Maps for navigation.

### 📝 Community Contributions

Users can suggest corrections when they find inaccurate or outdated information.

---

#  Key Features: ✨

- Church discovery and search
- Location-based church discovery
- Denomination-based filtering
- Language-based discovery
- Church-type categorization
- Basilica, Cathedral, Shrine and Parish classifications
- Mass and service timings
- Church descriptions and parish information
- Feast days and events
- Favorites
- Recently viewed churches
- Personalized denomination and language preferences
- Google Maps integration
- Church correction/contribution system
- Firebase authentication
- Persistent login sessions
- Light and dark theme support
- Empty states and error handling
- Responsive mobile UI
- Performance optimization for large datasets
- Firebase-powered remote church database
- APK distribution through GitHub Releases

---

# Application Architecture:

HolyWay follows a modular React Native structure separating the user interface, services, utilities and data.

A simplified flow looks like this:
   `
                    ┌─────────────────────┐
                    │      HolyWay App    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   React Native UI   │
                    │ Screens / Components │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Service Layer    │
                    │   churchService.js  │
                    └──────────┬──────────┘
                               │
                  ┌────────────▼────────────┐
                  │       Firebase          │
                  │ Authentication /       │
                  │ Cloud Firestore         │
                  └────────────┬────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Church Database   │
                    │ Timings / Languages │
                    │ Locations / Events  │
                    └─────────────────────┘

###  Tech Stack: 🛠️
### Frontend:
### JavaScript

The primary programming language used throughout the application.

### React Native:

Used to build the cross-platform mobile application and create reusable UI components.

### React Native Core Components:

The application uses React Native components and APIs including:

View
Text
Image
ScrollView
FlatList
TextInput
Pressable
TouchableOpacity
Modal
ActivityIndicator
Platform and device APIs

FlatList is particularly important for efficiently rendering the church dataset.

### Expo:

Expo is used as the development and build platform for the React Native application.

It was used for:

Development with Expo Go
Application configuration
Asset management
Notifications
Native device capabilities
Android application builds
EAS Build

### Backend & Database:
### Firebase

Firebase provides the backend infrastructure for HolyWay.

### Firebase Authentication

Used for:

User registration
Login
Persistent authentication sessions
Logout
### Cloud Firestore

Used as the primary remote database for:

Church information
Mass timings
Service timings
Languages
Locations
Feast days
Events
Parish information
User-related application data
Suggestions/corrections

The database was designed around a consistent church document structure so that different denominations can coexist within the same dataset.

### Maps & Location
### React Native Maps

Used to display and work with geographical church locations.

### Google Maps

Used to provide navigation and location access for individual churches.

### Notifications
### Expo Notifications

Used for notification-related functionality and reminders.

### Development & Build Tools
Git
GitHub
npm
Expo CLI
EAS CLI
EAS Build
Android development environment
Firebase Console

### 🗂️ Project Structure:
HolyWay/
│
├── assets/
│   ├── churches/
│   ├── icon.png
│   ├── icon_square.png
│   ├── splash_new.png
│   └── ...
│
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   ├── utils/
│   └── ...
│
├── scripts/
│
├── App.js
├── app.json
├── eas.json
├── index.js
├── package.json
└── README.md
