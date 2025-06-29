# Changelog

All notable changes to the AI Fine-tuning Dashboard will be documented in this file.

## [1.0.3] - 2025-06-29

### 🚀 Major Features

#### Hyperparameter Configuration System
- **UID-based Config Storage**: Hyperparameter configs are now stored in `hyperparameter-config.json` under a short UID encoding mode and adapter method. Only the UID is stored in `metadata.json`.
- **Best Config Suggestion**: Added `best_config_uid_manual` and `best_config_uid_automated` to `hyperparameter-config.json`. A "Suggest" button beside Training Parameters loads the best config for the current mode.
- **UID Decoding**: UID format and decoding instructions are documented in `hyperparameter-config.txt`.
- **Config Hashing**: UID includes a short hash of the config for uniqueness.

### 🔧 Bug Fixes

#### Range Slider Push Logic
- **Fixed Min/Max Slider Interaction**: In automated mode, minimum and maximum sliders now properly "push" each other when they get too close, maintaining a minimum gap of one step for smooth user experience.
- **Manual Input Push Logic**: Manual value input fields also implement the same pushing behavior to ensure consistency across all input methods.

### 🧩 UI/UX Improvements

- **Smooth Range Sliders**: Sliders for automated mode now allow the min and max to "push" each other with a minimum 1-step gap, never blocking, for a fluid experience.
- **Animated Suggestion**: When the "Suggest" button is clicked, sliders and values animate smoothly to the suggested config instead of jumping instantly.
- **Tooltips for All Parameters**: Added tooltips beside every training and LoRA parameter for better user guidance.
- **Batch Size Smart Warning**: Batch size slider now has a soft limit based on available memory (minimum 8, max 32). If exceeded, a toast warns the user about potential Out Of Memory issues in both manual and automated modes.
- **Streamlined Automated UI**: In automated mode, removed duplicate min/max value displays below sliders, keeping only the editable values at the top for cleaner interface.
- **Simplified Suggest Button**: Renamed from "Suggest Best" to just "Suggest" for cleaner appearance.

### 🛠️ Technical Enhancements

- **Config Decoupling**: All hyperparameter values are now managed in a single config file, referenced by UID, for easier experiment tracking and reproducibility.
- **TypeScript Improvements**: Fixed all type errors for UID encoding and config management.
- **API Integration Ready**: All config and metadata changes are compatible with backend API endpoints.

### 📝 Developer Experience

- **UID System Documentation**: Added `hyperparameter-config.txt` with full UID encoding/decoding scheme for future reference.
- **Changelog Updated**: All new features and improvements are documented in this changelog.

## [1.0.2] - 2025-06-26

### 🚀 Major Features

#### HuggingFace Model Management System
- **Real-time Model Updates**: Fixed models not appearing after add/remove operations without page refresh
- **Backend Synchronization**: Implemented robust backend connection handling with automatic fallback
- **Force Reconnect**: Added manual reconnect functionality to restore backend connection
- **Enhanced Search**: Improved HuggingFace model search with better error handling and status indicators
- **Connection Status**: Visual indicators showing backend connection status (green/yellow status messages)
- **Immediate UI Updates**: Models now appear instantly after successful add/remove operations

### 🔧 Bug Fixes

#### Model Selection Real-time Updates
- **Fixed Add/Remove Sync**: Models now update immediately after being added or removed via search
- **Backend Connection Handling**: Improved error handling when backend connection fails during initial load
- **Force Reload Logic**: Enhanced reload functionality that bypasses cache and forces fresh data retrieval
- **Status Tracking**: Added `isUsingBackend` flag to track connection status and data source
- **Enhanced Logging**: Comprehensive console logging with emoji indicators for debugging (🔍🌐✅❌📂🔄)

#### UI/UX Improvements
- **Icon Consistency**: Replaced emoji warning icons (⚠️) with proper caution icons (⚠) throughout the interface
- **Backend Status Messages**: Clear visual indicators distinguishing between backend-connected and local data modes
- **Reconnect Button**: Added "Reconnect" button with refresh icon for manual backend reconnection
- **Success Feedback**: Improved success/error messaging for model add/remove operations

#### Backend API Enhancements
- **Request Logging**: Added HTTP request logging middleware with 📨/📤 emoji indicators
- **Response Format**: Standardized API response format for add/remove operations with proper success/error structures
- **CORS Configuration**: Updated CORS settings to support frontend on port 3002
- **Error Handling**: Enhanced error responses with detailed status codes and messages

#### CSV Parsing Engine Fix
- **Pandas Compatibility**: Fixed "low_memory option not supported with python engine" error
- **Multiple Parsing Strategies**: Implemented fallback between Python and C engines
- **Enhanced Error Handling**: More robust CSV parsing with better error reporting
- **Improved Compatibility**: Better handling of various CSV formats and edge cases

#### FastAPI CSV Preview Backend
- **Real CSV Parsing**: Implemented Python FastAPI backend for actual CSV file processing
- **Pandas Integration**: Uses pandas for robust CSV parsing with automatic delimiter detection
- **Multi-encoding Support**: Handles UTF-8, UTF-8-BOM, and Latin-1 encodings automatically
- **Column Validation**: Server-side validation of required "input" and "output" columns
- **File Statistics**: Provides detailed metrics (total rows, columns, file size, preview rows)
- **Error Handling**: Graceful error handling with informative error messages
- **Automatic Fallback**: Falls back to mock data if backend is unavailable

#### Backend Infrastructure
- **FastAPI Server**: Modern async Python web framework
- **uv Package Management**: Uses uv for fast Python dependency management
- **CORS Configuration**: Properly configured for Next.js frontend integration
- **Health Monitoring**: Health check endpoints for system status
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Cross-platform Scripts**: Python and batch scripts for easy server startup

#### Frontend Integration
- **Real-time Preview**: Displays actual CSV content from uploaded files
- **Backend Status**: Shows whether real parsing or mock data is being used
- **Enhanced Validation**: Uses API validation errors for better user feedback
- **File Statistics**: Displays comprehensive file information in preview modal
- **Error Reporting**: Clear error messages from backend processing
- **Seamless Fallback**: Transparent fallback to mock data when backend offline

### 🔧 Enhanced Features

#### Model Management System Improvements
- **Force Reconnect**: Added `forceReconnect()` function for manual backend reconnection attempts
- **Enhanced State Management**: Improved model state synchronization between frontend and backend
- **Connection Timeout**: Added 5-second timeout to prevent hanging connections
- **Automatic Fallback**: Seamless fallback to local JSON data when backend is unavailable
- **Real-time Status**: Dynamic backend connection status tracking and user notification

#### Improved File Upload
- **Async Processing**: File upload now uses async CSV parsing
- **Progress Indicators**: Enhanced upload progress with parsing status
- **Error Validation**: File validation before and after upload
- **Status Indicators**: Visual indication of backend vs. mock data usage
- **Enhanced Feedback**: More detailed error messages and file information

#### Updated Preview Modal
- **File Statistics Section**: New statistics display showing file metrics
- **Enhanced Validation**: Uses API-provided validation errors
- **Backend Status**: Clear indication of data source (API vs. mock)
- **Improved Interface**: Better layout for additional file information

### 🏗️ Technical Infrastructure

#### Model Management Backend Updates
- **Enhanced Response Format**: Updated `ModelSelection.remove_model()` to return standardized response structure
- **Improved API Endpoints**: Modified `/api/models/{model_id}` DELETE endpoint for consistent response format
- **Request Middleware**: Added HTTP request logging middleware for debugging
- **Connection Handling**: Enhanced error handling and timeout management in API calls

#### New Backend Components
- `python-backend/main.py`: FastAPI application with CSV processing endpoints
- `python-backend/requirements.txt`: Python dependencies (FastAPI, pandas, uvicorn)
- `python-backend/start.py`: Cross-platform startup script with uv integration
- `python-backend/start.bat`: Windows batch script for easy startup

#### Frontend API Integration
- `src/utils/csvPreviewApi.ts`: API client for FastAPI backend communication
- Updated `src/utils/filePreviewUtils.ts`: Enhanced with real CSV parsing
- Updated `src/hooks/useFileUpload.ts`: Async file processing with backend integration
- **Enhanced Model Management**: Updated `src/hooks/useModelManagement.ts` with force reconnect and improved synchronization
- **UI Components**: Updated `src/components/model-selection/HuggingFaceSearch.tsx` with proper caution icons
- **Model Selection Page**: Enhanced `src/app/finetuning/model-selection/page.tsx` with reconnect button and status indicators
- Enhanced component interfaces with backend status and error handling

#### Development Experience
- **Comprehensive Documentation**: Updated README with backend setup instructions
- **API Documentation**: Auto-generated docs at `/docs` endpoint
- **Enhanced Debugging**: Console logging with emoji indicators for easy troubleshooting
- **Better Error Messages**: Improved error reporting throughout the model management system

### 🔍 Debugging & Monitoring

#### Console Logging Enhancements
- **🔍 Search Operations**: Clear logging for model search and discovery
- **🌐 Network Requests**: Detailed HTTP request/response logging
- **✅ Success Operations**: Success confirmation for add/remove operations
- **❌ Error Tracking**: Comprehensive error logging with context
- **📂 Data Source**: Clear indication of local vs. backend data usage
- **🔄 Reconnection**: Logging for manual reconnection attempts

#### Status Indicators
- **Green Status**: "Backend Connected - Full functionality available"
- **Yellow Status**: "Using local data - Start Python backend for search functionality"
- **Error States**: Clear messaging for connection failures and operational errors
- **Loading States**: Visual feedback during operations and reconnection attempts
- **Health Monitoring**: System health checks and status reporting
- **Error Logging**: Detailed logging for debugging and monitoring

### 📝 Documentation Updates
- **Backend Setup Guide**: Complete instructions for Python backend setup
- **API Reference**: Documentation of all backend endpoints
- **Fallback Behavior**: Explanation of automatic fallback mechanisms
- **Development Workflow**: Updated development instructions including backend

## [1.0.1] - 2025-06-25

### 🔧 Bug Fixes & Improvements

#### Dataset Selection Behavior Enhancement
- **Fixed Dataset Selection Flow**: Clicking on existing datasets now only opens preview modal (doesn't immediately select)
- **Explicit Selection Required**: Users must click "Next" in preview modal to actually select and proceed with dataset
- **Enhanced Preview Modal**: Added dataset ID tracking for proper selection flow
- **Async Selection Handling**: Updated dataset selection to properly handle metadata updates

#### Documentation Consolidation
- **Single README**: Consolidated all documentation into comprehensive main README.md
- **Removed Separate Docs**: Eliminated docs/ folder and separate markdown files for cleaner structure
- **Enhanced README**: Added complete API documentation, workflow guides, and production deployment info
- **Centralized Reference**: All necessary information now available in single location

### 🔄 Technical Changes

#### Component Updates
- **DatasetPreviewModal**: Enhanced to pass dataset ID for existing datasets
- **Page Component**: Updated `handleDatasetSaveAndProceed` to properly handle existing dataset selection
- **ExistingDatasets**: Clarified prop documentation for preview-only behavior

#### API Structure Improvements
- **Metadata API**: Confirmed working metadata persistence across sessions
- **Dataset UID Integration**: Proper UID generation and tracking in metadata
- **File Path Storage**: Enhanced dataset objects with file path and original filename tracking

### ✅ Validation & Testing

#### User Flow Validation
- ✅ Click existing dataset → Opens preview modal only
- ✅ Preview modal shows validation errors for missing columns
- ✅ "Next" button disabled for invalid datasets
- ✅ "Next" button enabled only for datasets with "input" and "output" columns
- ✅ Clicking "Next" properly selects dataset and updates metadata
- ✅ New upload flow works correctly with save and proceed

#### Build & Code Quality
- ✅ TypeScript compilation successful
- ✅ No ESLint errors or warnings
- ✅ All API routes functional
- ✅ Metadata persistence working correctly

### 📝 Developer Experience

#### Enhanced Documentation
- **Complete API Reference**: Full endpoint documentation with examples
- **Architecture Overview**: Detailed system architecture and data flow
- **Production Guide**: Comprehensive deployment and scaling instructions
- **Troubleshooting**: Common issues and solutions
- **Development Setup**: Step-by-step setup instructions

#### Debug Utilities
- **Metadata Viewer**: Browser console utility for debugging workflow state
- **Enhanced Logging**: Better console output for dataset selection and metadata updates
- **Error Handling**: Improved error messages and recovery

### 🎯 User Experience Improvements

#### Clearer Workflow
- **Preview Before Select**: Users can review dataset before committing to selection
- **Validation Feedback**: Clear error messages for datasets missing required columns
- **Professional UI**: Consistent styling with disabled states for invalid options
- **Progress Tracking**: Metadata system tracks complete user journey

#### Error Prevention
- **Column Validation**: Prevents proceeding with datasets lacking "input"/"output" columns
- **Clear Messaging**: Professional error messages without emojis
- **Disabled States**: UI clearly indicates when actions are not available

---

## Previous Versions

### [1.0.0] - 2025-06-25

### 🎯 Major Features Added

#### Dataset Management with UID System
- **Dataset UIDs**: Added unique identifier system for tracking datasets across the fine-tuning workflow
- **File Path Storage**: Store uploaded dataset file paths for future reference
- **Original Filename Preservation**: Maintain original uploaded filenames for user reference
- **Enhanced Dataset Interface**: Extended with `uid`, `filePath`, and `originalFileName` properties

#### Metadata Management System
- **Centralized Metadata**: Created `metadata.json` system to track complete fine-tuning workflow
- **Session Tracking**: Unique session IDs for each fine-tuning process
- **Cross-Screen Persistence**: Metadata carries forward through all workflow steps
- **API Integration Ready**: Structured for easy migration to backend APIs

#### Improved User Experience
- **Dataset Preview Only**: Clicking existing datasets now only previews (doesn't select)
- **Explicit Selection**: Users must click "Next" in preview modal to actually select dataset
- **Enhanced Validation**: Clear error messages for datasets missing required columns
- **Professional UI**: Removed emojis for cleaner, more professional appearance

### 🔧 Technical Improvements

#### Modular Architecture
- **Custom Hooks**: Refactored long logic into reusable hooks:
  - `useDatasetManagement`: Dataset CRUD operations
  - `useTagManagement`: Tag management logic  
  - `useFileUpload`: File upload handling
  - `useModalState`: Modal state management
- **Utility Functions**: Centralized utilities for file preview and validation
- **Component Organization**: Well-structured component hierarchy with clear separation of concerns

#### Data Structure Enhancements
```typescript
// Before
interface Dataset {
  id: string;
  name: string;
  // ... basic properties
}

// After  
interface Dataset {
  id: string;
  uid?: string;                 // NEW: Unique workflow identifier
  name: string;
  filePath?: string;            // NEW: File storage path
  originalFileName?: string;    // NEW: Original upload name
  // ... existing properties
}
```

#### Metadata Structure
```typescript
interface FinetuningMetadata {
  finetuningSession: {
    id: string | null;
    createdAt: string | null;
    lastModified: string | null;
    status: string;
  };
  dataset: {
    uid: string | null;         // Selected dataset UID
    id: string | null;
    name: string | null;
    selectedAt: string | null;
  };
  // ... future workflow steps
}
```

### 📁 Files Added

#### Core System Files
- `src/data/metadata.json` - Centralized workflow metadata storage
- `src/app/api/metadata/route.ts` - Metadata API endpoints
- `src/utils/datasetUtils.ts` - Enhanced with UID generation and metadata functions
- `public/metadata-viewer.js` - Development utility for metadata debugging

#### Documentation
- `docs/DATASET_SELECTION.md` - Complete dataset management guide
- `docs/API.md` - Comprehensive API documentation  
- `docs/WORKFLOW.md` - Fine-tuning workflow documentation
- `docs/PRODUCTION.md` - Production deployment guide
- `README.md` - Updated main documentation

#### Custom Hooks
- `src/hooks/useDatasetManagement.ts` - Dataset operations
- `src/hooks/useTagManagement.ts` - Tag management
- `src/hooks/useFileUpload.ts` - File upload handling
- `src/hooks/useModalState.ts` - Modal state management
- `src/hooks/index.ts` - Hook exports

### 🔄 Files Modified

#### Core Application Files
- `src/app/finetuning/dataset-selection/page.tsx` - Refactored with hooks, added async dataset selection
- `src/components/dataset-selection/DatasetPreviewModal.tsx` - Enhanced with dataset ID passing
- `src/components/dataset-selection/ExistingDatasets.tsx` - Updated for preview-only behavior
- `src/data/datasets.json` - Added UIDs and file paths to existing datasets

#### User Flow Changes
1. **Dataset Selection Flow**:
   - Before: Click dataset → Immediately selected
   - After: Click dataset → Preview modal → Click "Next" → Selected

2. **Validation Flow**:
   - Enhanced error messages for missing columns
   - Disabled "Next" button for invalid datasets
   - Clear visual feedback for validation state

### 🎯 Validation Requirements

#### Required Columns
All datasets must contain exactly these columns:
- `input`: Contains the input text/data for training
- `output`: Contains the expected output/response

#### Error Messages
- "Missing required 'input' column"
- "Missing required 'output' column"  
- "Model training cannot proceed without required columns"

### 🚀 Developer Experience

#### New Utilities
```typescript
// UID Generation
generateDatasetUID(): string

// Metadata Management  
loadMetadata(): Promise<FinetuningMetadata>
saveMetadata(metadata): Promise<boolean>
updateDatasetSelection(dataset): Promise<boolean>
```

#### Debug Tools
```javascript
// Browser console
viewMetadata(); // View current workflow metadata
```

#### Development Setup
- All functionality works with file-based storage
- Hot reloading supported
- TypeScript type checking
- Comprehensive error handling

### 📝 Comments for Production Migration

Added extensive comments throughout codebase marking:
- `TODO: Replace with real API calls` - API integration points
- File-based storage temporary solutions
- Database migration requirements
- Authentication integration points

### ✅ Testing & Validation

#### Build Status
- ✅ TypeScript compilation successful
- ✅ No ESLint errors
- ✅ All components render correctly
- ✅ API routes functional

#### Manual Testing Completed
- ✅ Upload new dataset with valid columns
- ✅ Upload dataset with invalid columns  
- ✅ Select existing valid dataset
- ✅ Select existing invalid dataset
- ✅ Preview modal validation
- ✅ Metadata persistence
- ✅ UID generation and tracking

### 🎯 Next Steps (Future Releases)

#### v1.1 - Model Configuration
- Model selection screen implementation
- Integration with metadata system
- Model parameter configuration

#### v1.2 - Training Setup  
- Training parameter configuration
- Integration with training APIs
- Progress tracking

#### v2.0 - Production Features
- Database migration
- Authentication system
- Multi-user support
- Cloud storage integration

---

## Previous Versions

### [0.9.0] - Pre-UID System
- Basic dataset selection functionality
- File upload and preview
- Local JSON storage
- Component-based architecture

### [0.8.0] - Initial Implementation  
- Next.js setup with TypeScript
- Tailwind CSS styling
- Basic dataset management
- Modal-based previews
