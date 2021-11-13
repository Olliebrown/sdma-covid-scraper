import React from 'react'

import { Link, Typography } from '@material-ui/core'

export default function Copyright (props) {
  return (
    <React.Fragment>
      <Typography variant="body2" color="textSecondary" align="center">
        {'Website Copyright © '}
        {new Date().getFullYear()}
        {' Seth Berrier and Monica Berrier.'}
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        {'Licensed under the '}
        <Link color="inherit" target="_blank" href="https://opensource.org/licenses/MIT">
          {'MIT license'}
        </Link>
      </Typography>
      <br />

      <Typography variant="body2" color="textSecondary" align="center">
        {'This web site is not affiliated with the School District of the Menomonie Area.'}
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        {'It is an independent project maintained by the community using publicly available data.'}
      </Typography>
      <br />

      <Typography variant="body2" color="textSecondary" align="center">
        {'Original data gathered from: '}
        <Link color="inherit" target="_blank" href="https://docs.google.com/spreadsheets/d/1y7J0hskF47_lDYMmgDj57jLThMCfnwrG">
          {'SDMA Covid Dashboard'}
        </Link>
      </Typography>
    </React.Fragment>
  )
}
