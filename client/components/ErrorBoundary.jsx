import React from 'react'
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core'

export default class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError (error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch (error, errorInfo) {
    console.error(error)
    console.error('Component Stack:', errorInfo.componentStack)
  }

  render () {
    const { children } = this.props
    const { hasError, error } = this.state

    if (hasError) {
      return (
        <React.Fragment>
          <Typography variant="h4" component="h2">
            {'An Error Occurred'}
          </Typography>
          <br />
          {error &&
            <React.Fragment>
              <Typography variant="body2">
                {error.toString()}
              </Typography>
              <br />
            </React.Fragment>}
          <Typography variant="body2">
            {'(see the browser console for more details)'}
          </Typography>
        </React.Fragment>
      )
    }

    // Otherwise just return children
    return children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}
