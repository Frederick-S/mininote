import { ChakraProvider } from '@chakra-ui/react';
import { Amplify } from 'aws-amplify';
import theme from './theme';
import outputs from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

function App() {
  return (
    <ChakraProvider value={theme}>
      <div>
        <h1>Web Note App</h1>
        <p>Personal note-taking application with AWS Amplify</p>
      </div>
    </ChakraProvider>
  );
}

export default App
