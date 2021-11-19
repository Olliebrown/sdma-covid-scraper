import React, { useEffect, useCallback } from 'react'

import SwipeableViews from 'react-swipeable-views'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import { AppBar, Tabs, Tab, Typography } from '@material-ui/core'

import TabContent from './TabContent.jsx'
import SDMAScrapeIcon from './SDMAScrapeIcon.jsx'
import TabPanel from './TabPanel.jsx'
import BarChartTab from './BarChartTab.jsx'
import LineChartTab from './LineChartTab.jsx'
import CSVTable from './CSVTable.jsx'
import AboutTab from './AboutTab.jsx'

export function a11yPropsTab (name) {
  return {
    id: `action-tab-${name}`,
    'aria-controls': `action-tabpanel-${name}`
  }
}

const useStyles = makeStyles((theme) => ({
  headingRoot: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  pageRoot: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    minHeight: 200
  }
}))

const TAB_INFO = [
  { name: 'bar-graph-view', label: 'Bar Graph View' },
  { name: 'stacked-bar-graph-view', label: 'Stacked Bar Graph View' },
  { name: 'history-line-graph-view', label: 'History Line Graph View' },
  { name: 'data-table-view', label: 'Raw Data Table' },
  { name: 'about', label: 'About' }
]

export default function InstructionsTabbed () {
  const classes = useStyles()
  const theme = useTheme()
  const [activeIndex, setActiveIndex] = React.useState(0)

  const handleChangeTab = (event, newValue) => {
    setActiveIndex(newValue)
  }

  const handleChangeIndex = (index) => {
    setActiveIndex(index)
  }

  const tabContent = [
    <TabContent key={0}><BarChartTab /></TabContent>,
    <TabContent key={1}><BarChartTab stacked /></TabContent>,
    <TabContent key={2}><LineChartTab /></TabContent>,
    <TabContent key={3}><CSVTable /></TabContent>,
    <TabContent key={4}><AboutTab /></TabContent>
  ]

  // Hash change listener function
  const hashChangeListener = useCallback(() => {
    switch (window.location.hash) {
      case '#bar-graph-view': setActiveIndex(0); break
      case '#stacked-bar-graph-view': setActiveIndex(1); break
      case '#history-line-graph-view': setActiveIndex(2); break
      case '#data-table-view': setActiveIndex(3); break
      case '#about-view': setActiveIndex(4); break
    }
  }, [])

  // Initialize and respond to updated hashes
  useEffect(() => {
    hashChangeListener()
    window.addEventListener('hashchange', hashChangeListener)
    return () => {
      window.removeEventListener('hashchange', hashChangeListener)
    }
  }, [hashChangeListener])

  return (
    <React.Fragment>
      <div className={classes.headingRoot}>
        <SDMAScrapeIcon />
        <Typography component="h1" variant="h4">
          {'COVID Cases and Exclusions in SDMA Schools'}
        </Typography>
      </div>
      <div className={classes.pageRoot}>
        <AppBar position="static" color="default">
          <Tabs
            value={activeIndex}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="SDMA Covid Data Explorer"
          >
            {TAB_INFO.map((curTab, i) => (
              <Tab
                key={curTab.name}
                label={curTab.label}
                className={classes.tabStyle}
                {...a11yPropsTab(curTab.name)}
              />
            ))}
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeIndex}
          onChangeIndex={handleChangeIndex}
        >
          {TAB_INFO.map((curTab, i) => (
            <TabPanel
              key={curTab.name}
              name={curTab.name}
              active={activeIndex === i}
              dir={theme.direction}
            >
              {tabContent[i]}
            </TabPanel>
          ))}
        </SwipeableViews>
      </div>
    </React.Fragment>
  )
}
