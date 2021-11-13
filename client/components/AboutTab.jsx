import React from 'react'

import { Grid, Typography, Link } from '@material-ui/core'

export default function AboutTab () {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h2">
          {'About the SDMA COVID Data Scraper'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {'This webpage offers customizable graphical representations of historical data '}
          {'harvested from the daily '}
          <Link target="_blank" href="https://docs.google.com/spreadsheets/d/1y7J0hskF47_lDYMmgDj57jLThMCfnwrG">
            {'2021-2022 SDMA COVID-19 Data Dashboard'}
          </Link>
          {'. That dashboard only offers data for the most recent school day without the '}
          {'ability to view previous days, making it impossible to see how the data is trending. '}
          {'To fill this gap, our server interrogates the SDMA COVID Dashboard several times daily '}
          {'and saves the changes for viewing here beginning on November 12, 2021.'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {'Our page offers several different options for customizing the data visualization, '}
          {'allowing users to toggle on/off different schools and statistics. You can also view '}
          {'the exact original data as it was captured and download it as a CSV formatted file.'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h3">{'Who We Are'}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {'We are parents of two children in the SDMA that believe in the importance of safer '}
          {'COVID-19 policies in public schools. We believe schools should implement evidence-based '}
          {'safety protocols like universal masking when needed to reduce school spread and minimize '}
          {'exclusions. Such measures benefit all members of the community, including the students, '}
          {'their parents and families, older adults, disabled and other higher-risk individuals, and '}
          {'generally anyone who wants life to get back to normal as quickly as possible. In our advocacy '}
          {'work, we were interested in having a historical view of the case counts and exclusions within '}
          {'the district, but this data was not available through the SDMA daily dashboard. We wrote this '}
          {'program to harvest the daily data so that we could see the trends and are making this '}
          {'accessible to others who may be interested in this data.'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h3">{'Technical Details and Support'}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {'The source code for the server that runs this website and the front-end that runs in your '}
          {'browser is '}
          <Link target="_blank" href="https://github.com/Olliebrown/sdma-covid-scraper">
            {'publicly available on github'}
          </Link>
          {'. If you encounter any errors, you can submit a bug report to the '}
          <Link target="_blank" href="https://github.com/Olliebrown/sdma-covid-scraper/issues">
            {'repository issues list'}
          </Link>
          {', however this is a "spare-time" project and we cannot guarantee any support.'}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {'The following open-source, front-end browser technologies are employed in this website:'}
        </Typography>
        <ul>
          <Typography variant="body1" component="li">{'React.js for client web page generation'}</Typography>
          <Typography variant="body1" component="li">{'Material-UI for front-end component styling'}</Typography>
          <Typography variant="body1" component="li">{'Recoil for global state management'}</Typography>
          <Typography variant="body1" component="li">{'Recharts based on d3.js for for graphing of data'}</Typography>
        </ul>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          {'The following back-end server technologies are employed in this website:'}
        </Typography>
        <ul>
          <Typography variant="body1" component="li">{'Express.js for our http server'}</Typography>
          <Typography variant="body1" component="li">{'MongoDB for the back-end database'}</Typography>
          <Typography variant="body1" component="li">{'MongoDB Atlas for database cloud hosting'}</Typography>
          <Typography variant="body1" component="li">{'Heroku for server hosting'}</Typography>
        </ul>
      </Grid>
    </Grid>
  )
}
