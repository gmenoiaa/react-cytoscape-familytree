import './App.css';
import CytoscapeComponent from 'react-cytoscapejs/src/component'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import {buildData} from './data'
import {useEffect, useState} from 'react'

cytoscape.use(dagre)

const data = buildData(3)
const persons = Object.entries(data.persons).map(([id, person]) => ({ data: { id: id, name: person.name, gender: person.gender, type: 'person' } }))
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
        const firstIncomingNode = union.incomers().find(element => element.isNode())
        union.position('y', firstIncomingNode.position('y'))

        // const outgoingEdges = union.outgoers().filter(element => element.isEdge())
        //
        // for (const edge of outgoingEdges) {
        //   console.log(edge.sourceEndpoint())
        // }
      }

    }
  }

  const style = [
    {
      selector: 'node[type = "person"]',
      style: {
        'content': 'data(name)',
        'text-valign': 'center',
        'text-halign': 'center',
        'shape': 'rectangle',
        'width': 150,
        'height': 50,
      }
    },
    {
      selector: 'node[gender = "male"]',
      style: {
        'background-color': '#ade1ff',
      }
    },
    {
      selector: 'node[gender = "female"]',
      style: {
        'background-color': '#f3c2c2',
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

  useEffect(() => {
    if (!cy) {
      return
    }

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
