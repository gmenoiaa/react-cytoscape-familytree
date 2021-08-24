/* eslint-disable no-unused-vars */
import {useEffect, useState} from 'react'
import CytoscapeComponent from 'react-cytoscapejs/src/component'
import cytoscape from 'cytoscape'
import nodeHtmlLabel from 'cytoscape-node-html-label'
import dagre from 'cytoscape-dagre'
import {buildData} from './data'
import {oldData} from './data'
import './App.css';

cytoscape.use(dagre)

if (typeof cytoscape('core', 'nodeHtmlLabel') === 'undefined') {
  nodeHtmlLabel(cytoscape);
}

function prepareData(levels = 3) {
  const data = buildData(levels)

  const persons = Object.entries(data.persons).map(([id, person]) => ({ data: { id: id, name: person.name, gender: person.gender, type: 'person' }, classes: 'node--person' }))
  const unions = Object.keys(data.unions).map(id => ({ data: { id, type: 'union' } }))
  const edges = data.links.map(([src, trg]) => ({ data: { id: `${src}-${trg}`, source: src, target: trg } }))

  let nodes = {
    nodes: [
      ...persons,
      ...unions,
    ],
    edges
  }

  return nodes
}

const CARD_WIDTH = 150

function App() {
  // const location = useLocation();
  const [cy, setCy] = useState()
  const [elements, setElements] = useState({})

  const layout = {
    name: 'dagre',
    fit: true,
    zoom: 1,
    nodeSep: 200,
    edgeSep: 0,
    ready: event => {
      const elements = event.cy.elements()
      const unions = elements.filter(element => element.data().type === 'union' && element.isNode())

      const nodeUnions = unions.reduce((acc, union) => {
        const incomingNodes = union.incomers().filter(element => element.isNode() && element.data.target === union.data.id)
        for (const node of incomingNodes) {
          const id = node.data().id
          if (!acc[id]) {
            acc[id] = []
          }
          acc[id].push(union)
        }
        return acc
      }, {})

      for (const union of unions) {
        // make the union point at the same y position as the nodes
        const incomingNodes = union.incomers().filter(element => element.isNode() && element.data.target === union.data.id)

        if (incomingNodes.length > 1) {
          union.shift({x : 0, y : (incomingNodes[0].position('y') - union.position('y'))})
          // union.position('y', incomingNodes[0].position('y'))
        } else {
          // TODO: think about hiding the union node in this case (because it means there are some kids linking to the union node, but there's only one "person" node in the graph)
          // TODO: do we even allow single parents ? or maybe we add support for placeholder nodes for the spouse in this case
        }

        // adjust how far partners are from union node, but only if one partner
        const unionX = union.position('x')
        for (const incomingNode of incomingNodes) {
          const nodeX = incomingNode.position('x')

          if (nodeUnions[incomingNode.data().id].length === 1) {
            if (Math.abs(nodeX - unionX) > CARD_WIDTH) {
              incomingNode.position('x', unionX + (layout.nodeSep * (nodeX > unionX ? 1 : -1)))
            }
          }
        }

        // adjust union position to be exactly in the center of partners
        for (const incomingNode of incomingNodes) {
          const incomingNodeBox = incomingNode.boundingBox()
          const unionPosition = union.position()

          if (incomingNodeBox.x1 < unionPosition.x && incomingNodeBox.x2 > unionPosition.x) {
            const partnerNode = incomingNodes.find(otherNode => otherNode.data().id !== incomingNode.data().id)
            const incomingNodeX = incomingNode.position().x
            const partnerNodeX = partnerNode.position().x
            const incomingPartnerCenterX = (partnerNodeX - incomingNodeX) / 2
            union.position('x', incomingNodeX + incomingPartnerCenterX)
          }
        }
      }

    }
  }

  const stylesConfig = {
    edgeColor: '#666',
    edgeWidth: 1
  }

  const style = [
    {
      selector: 'node[type = "person"]',
      style: {
        // 'content': 'data(name)',
        // 'text-valign': 'center',
        // 'text-halign': 'center',
        'shape': 'rectangle',
        'width': CARD_WIDTH,
        'height': 50,
        'background-color': '#fff',
      }
    },
    {
      selector: 'node[type = "union"]',
      style: {
        'background-color': `${stylesConfig.edgeColor}`,
        'width': 10,
        'height': 10,
      }
    },
    {
      selector: ':parent',
      css: {
        'text-valign': 'top',
        'text-halign': 'center',
      }
    },

    // TODO: introduce edge-marriage (straight lines instead of taxi)
    {
      selector: 'edge',
      style: {
        'curve-style': 'taxi',
        'taxi-direction': 'vertical',
        'line-color': `${stylesConfig.edgeColor}`,
        'width': `${stylesConfig.edgeWidth}`,
        // 'edge-distances': 'node-position',
        // 'source-endpoint': '0deg',
        // 'target-endpoint': '50%',
      }
    },

    // Edge: Divorced
    {
      selector: 'edge.edge--divorced',
      style: {
        'curve-style': 'taxi',
        'taxi-direction': 'vertical',
        'line-color': `${stylesConfig.edgeColor}`,
        'line-style': 'dashed',
        'width': `${stylesConfig.edgeWidth}`,
        // 'edge-distances': 'node-position',
        // 'source-endpoint': '0deg',
        // 'target-endpoint': '50%',
      }
    }
  ]

  useEffect(() => {
    if (!cy) {
      return
    }

    cy.nodeHtmlLabel([
      {
        query: '.node--person',
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const level = Number(params.get('level'))

    // const data = prepareData(level ? level : 3)
    let data = oldData

    // adding proper classes for person nodes
    data.nodes
      .filter((node) => { return node.data.type === 'person' })
      .forEach((node) => { node.classes = "node--person" })

    // adding proper classes for "divorced" relationships
    let divorceUnions = data.nodes.filter((node) => {
      return node.data.type === 'union' && node.data.divorced !== undefined && node.data.divorced
    })

    divorceUnions.forEach((union) => {
      data.edges
        .filter((edge) => { return edge.data.target === union.data.id })
        .forEach((edge) => { edge.classes = "edge--divorced"})
    })

    setElements(data)
  }, [])

  return (
    <CytoscapeComponent
      className="App"
      cy={cy => setCy(cy)}
      elements={CytoscapeComponent.normalizeElements(elements)}
      stylesheet={style}
      layout={layout}
      // minZoom={0.5}
      // maxZoom={3.0}
      // autoungrabify={true}
      // boxSelectionEnabled={false}
    />
  );
}

export default App;
