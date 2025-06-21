# 🚪 Jailmail

A modern web application for writing letters to incarcerated loved ones with a beautiful, responsive interface.

## Features

- **User Authentication**: Sign up and sign in with email/password
- **Write Letters**: Compose and send letters to your loved ones
- **Photo Attachments**: Upload and share photos with your letters
- **Recipient Management**: Save and manage recipient information (names and addresses)
- **Letter History**: View all your past letters organized by date
- **Real-time Updates**: See new letters as they're sent
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations

## Tech Stack

- **Frontend**: React.js with modern hooks
- **Backend**: Supabase (PostgreSQL database + authentication + file storage)
- **Styling**: CSS3 with modern design patterns
- **Icons**: Lucide React icons

## Setup Instructions

### 1. Install Dependencies

First, install all the required packages:

```bash
npm install
```

### 2. Set Up Supabase

You'll need to create a Supabase project to store your data. Here's how:

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Credentials**:
   - In your Supabase dashboard, go to Settings → API
   - Copy your "Project URL" and "anon public" key

3. **Set Environment Variables**:
   Create a `.env` file in the root directory:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Set Up Database Tables

In your Supabase dashboard, go to the SQL Editor and run these commands:

```sql
-- Create the recipients table for managing letter recipients
CREATE TABLE recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the messages table for letters (updated to include recipient)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  photo_url TEXT,
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for the recipients table
-- Allow users to read their own recipients
CREATE POLICY "Allow users to read own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own recipients
CREATE POLICY "Allow authenticated users to insert recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own recipients
CREATE POLICY "Allow users to update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own recipients
CREATE POLICY "Allow users to delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for the messages table
-- Allow users to read all messages
CREATE POLICY "Allow users to read all messages" ON messages
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own messages
CREATE POLICY "Allow authenticated users to insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own messages
CREATE POLICY "Allow users to update own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Allow users to delete own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Set Up File Storage

In your Supabase dashboard:

1. Go to Storage → Create a new bucket
2. Name it `photos`
3. Make it public (so images can be viewed)
4. Set up storage policies:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Allow public access to view photos
CREATE POLICY "Allow public access to view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');
```

### 5. Configure Authentication

In your Supabase dashboard:

1. Go to Authentication → Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add redirect URLs if needed

### 6. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## How It Works

### Authentication Flow
1. Users can sign up with email/password
2. Supabase handles email verification
3. Users can sign in and stay logged in across sessions

### Letter Writing
1. Users select or create a recipient for their letter
2. Users write letters in the text area
3. Optionally upload photos (stored in Supabase Storage)
4. Letters are saved to the PostgreSQL database with recipient information
5. All users can see letters in real-time

### Recipient Management
1. Users can add, edit, and delete recipient profiles
2. Each recipient has a name and complete address
3. Recipients are private to each user
4. Easy management for multiple incarcerated loved ones
5. Recipients can be created directly from the letter writing page

### Data Structure
- **Users**: Stored in Supabase Auth (email, password, etc.)
- **Messages**: Stored in `messages` table (content, photo_url, recipient_id, user_id, timestamp)
- **Recipients**: Stored in `recipients` table (name, address, user_id, timestamp)
- **Photos**: Stored in Supabase Storage bucket

## File Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── Login.css         # Login styling
│   ├── MessageBoard.js   # Letter writing component
│   ├── MessageBoard.css  # Letter writing styling
│   ├── MyPosts.js        # Letter history component
│   ├── MyPosts.css       # Letter history styling
│   ├── Recipients.js     # Recipient management component
│   └── Recipients.css    # Recipient management styling
├── App.js               # Main app component
├── App.css              # App-wide styling
├── index.js             # React entry point
└── supabase.js          # Supabase client configuration
```

## Customization

### Styling
- Modify the CSS files to change colors, fonts, and layout
- The app uses CSS custom properties for easy theming
- All components are responsive and mobile-friendly

### Features
- Add letter editing/deletion
- Implement letter templates
- Create letter categories or tags
- Add letter scheduling features
- Add recipient search and filtering

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports React apps:
- Netlify
- Heroku
- AWS Amplify
- Firebase Hosting

## Troubleshooting

### Common Issues

1. **"Supabase URL not found"**: Check your environment variables
2. **"Permission denied"**: Verify your database policies are set up correctly
3. **"Photo upload failed"**: Check your storage bucket permissions
4. **"Authentication not working"**: Verify your Supabase Auth settings

### Getting Help
- Check the Supabase documentation
- Review the browser console for error messages
- Ensure all environment variables are set correctly

## License

This project is open source and available under the MIT License. 