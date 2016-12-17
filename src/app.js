import React, { Component } from 'react'
import _ from 'lodash'
import {Block, Flex} from 'jsxstyle'

const Button = (props) => <button type='button' {...props} style={{border: 'solid 1px white', backgroundColor: 'white', fontSize: '16px', ...props.style}} />

const combos = [
  {type: 'webp', density: '1x'},
  {type: 'jpg', density: '1x'},
  {type: 'webp', density: '2x'},
  {type: 'jpg', density: '2x'},
]

const SERVER = process.env.SERVER || 'http://localhost:3005'

function Slide({job}) {
  let {id} = job
  let srcSet = combos.map(({type, density}) => {
    return `${SERVER}/completed/${id}/featured?type=${type}&density=${density}&width=1500 ${density}`
  }).join(', ')
  return (
    <Block>
      <img style={{maxWidth: '100%', maxHeight: '100vh'}} src={`${SERVER}/completed/${id}/featured`} srcSet={srcSet} role='presentation' />
    </Block>
  )
}

function Controls({onNext, onPrevious, canGoNext, canGoBack, isPaused, play}) {
  return (
    <Flex flexDirection='row' position='absolute' top='0' width='100vw' height='100vh' alignItems='stretch'>
      <Flex flexDirection='row' justifyContent='flex-start' alignItems='center' flex='1' props={{onClick: ev => canGoBack && onPrevious(ev)}}>
        <Button disabled={!canGoBack} onClick={ev => canGoBack && onPrevious(ev)}>Previous</Button>
      </Flex>
      <Flex flexDirection='row' justifyContent='flex-end' alignItems='center' flex='1' props={{onClick: ev => canGoNext && onNext(ev)}}>
        <Button disabled={!canGoNext} onClick={ev => canGoNext && onNext(ev)}>Next</Button>
      </Flex>
      {isPaused ? <Button style={{position: 'absolute', bottom: '0', left: '0', right: '0'}} onClick={play}>Play</Button> : null}
    </Flex>
  )
}

class App extends Component {
  state = {
    loading: true,
    stack: [],
    index: 0,
    maxSize: 10,
    paused: false,
    interval: 15000,
    intervalId: 0,
  }

  componentWillMount() {
    this.getNewSlide()
    this.start()
  }

  start = () => {
    this.setState({paused: false, intervalId: setInterval(this.getNewSlide, this.state.interval)})
  }

  getRandomJob = async () => {
    return fetch(`${SERVER}/shuffle`).then(r => r.json()).then(arr => arr[0])
  }

  getNewSlide = async () => {
    this.setState({loading: true})
    let job = await this.getRandomJob()
    this.setState({stack: [job, ..._.take(this.state.stack, this.state.maxSize - 1)], loading: false, index: 0})
  }

  onNextSlide = (ev) => {
    ev.stopPropagation()
    this.pause()
    if (this.state.index - 1 >= 0) {
      this.setState({index: this.state.index - 1})
      return
    }
    this.getNewSlide()
  }

  onPreviousSlide = (ev) => {
    ev.stopPropagation()
    this.pause()
    this.setState({index: this.state.index + 1})
  }

  canGoBack = () => {
    return !(this.state.index + 1 >= this.state.stack.length)
  }

  pause = () => {
    clearInterval(this.state.intervalId)
    this.setState({paused: true})
  }

  play = () => {
    this.start()
  }

  render() {
    return (
      <Block backgroundColor='#484848'>
        <Flex minHeight='100vh' flex='1' component='main' justifyContent='center' alignItems='center'>
          {this.state.loading
            ? <Block color='white'>Loading…</Block>
            : <Slide job={this.state.stack[this.state.index]} />}
        </Flex>
        <Controls
          canGoNext={true}
          canGoBack={this.canGoBack()}
          onNext={this.onNextSlide}
          onPrevious={this.onPreviousSlide}
          isPaused={this.state.paused}
          play={this.play}
        />
      </Block>
    )
  }
}

export default App
