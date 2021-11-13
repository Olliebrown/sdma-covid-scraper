import React, { Suspense } from 'react'
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core'

import ErrorBoundary from './ErrorBoundary.jsx'

function Loading () {
  return (
    <Typography variant="h4" component="h2">{'Loading data ...'}</Typography>
  )
}

export default function TabContent (props) {
  const { children } = props

  return (
    <Suspense key={0} fallback={<Loading />}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Suspense>
  )
}

TabContent.propTypes = {
  children: PropTypes.node.isRequired
}
