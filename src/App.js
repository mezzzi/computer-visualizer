import React, { useState } from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import { Drawer } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import './App.css'
import CompilerFirstStage from 'components/CompilerFirstStage'
import { ROUTINGS } from 'constants/routing'
import CodeMirrorComponent from 'components/Codemirror'
import MainContextProvider from 'contexts'
import CompilerSecondStage from 'components/CompilerSecondStage'
import { TealButton } from 'components/Buttons'
import DrawerItem from 'components/DrawerItem'
import VmSimulator from 'components/VmTranslationSimulator'
function App () {
  const [visible, setVisible] = useState(false)

  const showDrawer = () => setVisible(true)

  const closeDrawer = () => setVisible(false)

  return (
    <div className='App'>
      <TealButton
        className='navigationDdrawerButton'
        style={{ textAlign: 'center' }}
        icon={<MenuOutlined />}
        onClick={showDrawer}
      />
      <MainContextProvider>
        <Switch>
          <Route exact path={ROUTINGS.MAIN} component={CodeMirrorComponent} />
          <Route path={ROUTINGS.COMPILER_FIRST_STAGE} component={CompilerFirstStage} />
          <Route path={ROUTINGS.COMPILER_SECOND_STAGE} component={CompilerSecondStage} />
          <Route path={ROUTINGS.VM_TRANSLATOR} component={VmSimulator} />
        </Switch>
      </MainContextProvider>
      <Drawer
        title='Navigation'
        placement='left'
        visible={visible}
        closable={false}
        onClose={closeDrawer}
      >
        <Link onClick={closeDrawer} to={ROUTINGS.MAIN}><DrawerItem bg='teal' co='white' text='Editor' /></Link>
        <Link onClick={closeDrawer} to={ROUTINGS.COMPILER_FIRST_STAGE}><DrawerItem bg='#b34d4d' co='white' text='Compiler I' /></Link>
        <Link onClick={closeDrawer} to={ROUTINGS.COMPILER_SECOND_STAGE}><DrawerItem bg='#660000' co='white' text='Compiler II' /></Link>
        <Link onClick={closeDrawer} to={ROUTINGS.VM_TRANSLATOR}><DrawerItem bg='#2196F3' co='white' text='VM Translator' /></Link>
      </Drawer>
    </div>
  )
}

export default App
