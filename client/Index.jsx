
import React from 'react'
import ReactDOM from 'react-dom'

import { RecoilRoot } from 'recoil'
import { Box, Container, CssBaseline } from '@material-ui/core'

import Copyright from './components/Copyright.jsx'
import MainPage from './components/MainPage.jsx'

// Render the form
ReactDOM.render(
  <Container component="main">
    <CssBaseline />
    <RecoilRoot>
      <MainPage />
    </RecoilRoot>
    <Box mt={8} mb={4}>
      <Copyright />
    </Box>
  </Container>,
  document.getElementById('root')
)
