# Mapbox Address Autofill Integration

This document provides instructions on how to set up and use the Mapbox Address Autofill functionality in your Food Truck Flow application.

## Setup Instructions

### 1. Create a Mapbox Account

If you don't already have a Mapbox account, visit [Mapbox's website](https://account.mapbox.com/auth/signup/) to create one.

### 2. Get an Access Token

1. Once you have created an account, navigate to your [Mapbox account page](https://account.mapbox.com/)
2. Go to the "Access tokens" section
3. Either use the default public token or create a new token with the following scopes:
   - `mapbox.places`
   - `mapbox.search`

### 3. Configure the Application

1. In your project's root directory, locate the `.env.local` file
2. Update the value of `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` with your Mapbox access token:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_mapbox_token_here
```

## Features

The Mapbox Address Autofill integration provides the following features:

1. **Address Suggestions**: As you type an address, Mapbox will provide intelligent suggestions based on your input.

2. **Coordinate Capture**: When an address is selected from the suggestions, the system automatically captures the coordinates (latitude and longitude) for that location.

3. **Get Directions**: The weekly schedule display includes "Get Directions" buttons that link to Google Maps and Apple Maps using the captured coordinates.

## Usage

### Adding or Editing a Schedule

1. Navigate to the Schedule management page
2. Click "Add Schedule" or edit an existing schedule
3. In the address field, start typing the address
4. Select an address from the suggestions dropdown
5. The coordinates will be automatically captured and saved with the address

### Viewing Directions

On the public-facing weekly schedule page:

1. Each location now has "Google Maps" and "Apple Maps" buttons
2. Clicking these buttons will open the respective mapping application with the location pre-filled
3. If coordinates are not available for a location, the buttons will be disabled with a message indicating that coordinates are unavailable

## Troubleshooting

If the Address Autofill functionality isn't working as expected:

1. Verify that you've correctly set the Mapbox access token in the `.env.local` file
2. Check that the token has the necessary permissions (`mapbox.places` and `mapbox.search`)
3. Ensure the address input field has the `autoComplete="address-line1"` attribute

For further information, refer to the [Mapbox Search JS documentation](https://docs.mapbox.com/mapbox-search-js/api/react/autofill/). 