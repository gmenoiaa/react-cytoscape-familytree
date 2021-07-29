import {useEffect, useState} from 'react'
import CytoscapeComponent from 'react-cytoscapejs/src/component'
import cytoscape from 'cytoscape'
import nodeHtmlLabel from 'cytoscape-node-html-label'
import dagre from 'cytoscape-dagre'
import {buildData} from './data'
import './App.css';

cytoscape.use(dagre)

if (typeof cytoscape('core', 'nodeHtmlLabel') === 'undefined') {
  nodeHtmlLabel(cytoscape);
}

const data = buildData(3)
const persons = Object.entries(data.persons).map(([id, person]) => ({ data: { id: id, name: person.name, gender: person.gender, type: 'person' }, classes: 'l1' }))
const unions = Object.keys(data.unions).map(id => ({ data: { id, type: 'union' } }))
const edges = data.links.map(([left, right]) => ({ data: { id: `${left}-${right}`, source: left, target: right } }))

console.log('persons count', persons.length)

function App() {
  const [cy, setCy] = useState()

  const layout = {
    name: 'dagre',
    fit: false,
    ready: event => {
      const elements = event.cy.elements()
      const unions = elements.filter(element => element.data().type === 'union' && element.isNode())

      for (const union of unions) {
        // make the union point at the same y position as the nodes
        const incomingNodes = union.incomers().filter(element => element.isNode())
        union.position('y', incomingNodes[0].position('y'))

        // adjust how far partners are from union node
        const unionX = union.position('x')
        for (const incomingNode of incomingNodes) {
          const nodeX = incomingNode.position('x')
          if (Math.abs(nodeX - unionX) > 200) {
            console.log(incomingNode.data(), nodeX, unionX)
            incomingNode.position('x', unionX + (nodeX > unionX ? 100 : -100))
          }
        }

      }

    }
  }

  const style = [
    {
      selector: 'node[type = "person"]',
      style: {
        // 'content': 'data(name)',
        // 'text-valign': 'center',
        // 'text-halign': 'center',
        'shape': 'rectangle',
        'width': 150,
        'height': 50,
        'background-color': '#fff'
      }
    },
    {
      selector: 'node[type = "union"]',
      style: {
        'background-color': '#eee',
      }
    },
    {
      selector: ':parent',
      css: {
        'text-valign': 'top',
        'text-halign': 'center',
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'taxi',
        'taxi-direction': 'vertical',
      }
    }
  ]

  const elements = CytoscapeComponent.normalizeElements({
    nodes: [
      ...persons,
      ...unions,
    ],
    edges
  })

  // const elements = CytoscapeComponent.normalizeElements(oldData)

  useEffect(() => {
    if (!cy) {
      return
    }

    cy.nodeHtmlLabel([
      {
        query: '.l1',
        halign: "center",
        valign: "center",
        halignBox: "center",
        valignBox: "center",
        tpl: (data) => {
          return `<div class="card ${data.gender}">
                <div class="card__image">
                    <img alt="Card image" src="https://previews.123rf.com/images/zurijeta/zurijeta1107/zurijeta110700136/10087069-closeup-profile-on-a-good-looking-old-man.jpg" />
                </div>
                <div class="card__details">
                    <span class="card__details__name">${data.name}</span>
                    <span class="card__details__birth">01.01.1990</span>
                </div>
            </div>`
        }
      }
    ]);

    cy.fit()
  }, [cy])

  return (
    <CytoscapeComponent
      className="App"
      cy={cy => setCy(cy)}
      elements={elements}
      stylesheet={style}
      layout={layout}
    />
  );
}

export default App;
