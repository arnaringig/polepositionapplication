import React from 'react'

import stylesheet from 'styles/index.scss'
import stylesheet2 from 'pages/style.scss'
import stylesheet3 from 'node_modules/antd/dist/antd.css'
import App from './App'

export default () =>
  <div>
    <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
    <style dangerouslySetInnerHTML={{ __html: stylesheet2 }} />
    <style dangerouslySetInnerHTML={{ __html: stylesheet3 }} />  

    <App/>

  </div>
