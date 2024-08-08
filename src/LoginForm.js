import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

export default function SignIn({ setAuthenticated }) {
  const [error, setError] = React.useState('');  // State to handle error messages
  const [loading, setLoading] = React.useState(false);  // State to handle loading status

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');  // Clear previous error
    setLoading(true);  // Set loading to true when the request starts

    const data = new FormData(event.currentTarget);

    // Create the JSON payload
    const payload = {
      username: data.get('username'),
      password: data.get('password'),
    };

    try {
      // Send login request to Flask server
      const response = await fetch('https://flask-backend-vp3q.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setLoading(false);  // Set loading to false when the request ends

      if (response.ok) {
        setAuthenticated(true);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);  // Set loading to false if there's an error
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={!!error}  // Show red border if there's an error
              helperText={error}  // Display error message
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}  // Disable the button when loading
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}  {/* Show loading spinner */}
            </Button>
            
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
