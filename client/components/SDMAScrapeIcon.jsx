import React from 'react'

import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { History } from '@material-ui/icons'

// These colors are borrowed from the default MUI palette
// https://material-ui.com/customization/palette/
const useStyles = makeStyles((theme) => ({
  avatarStyle: {
    margin: theme.spacing(1),
    backgroundColor: '#4E0221',
    width: theme.spacing(9),
    height: theme.spacing(9)
  },
  iconStyle: {
    fontSize: 'xxx-large',
    textAlign: 'center',
    color: '#FFFFFF'
  }
}))

export default function SDMAScrapeIcon () {
  const { avatarStyle, iconStyle } = useStyles()

  return (
    <Avatar className={avatarStyle}>
      <History className={iconStyle} />
    </Avatar>
  )
}
