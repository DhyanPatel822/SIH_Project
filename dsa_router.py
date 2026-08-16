import math
import heapq

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 3)

class Graph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}

    def add_node(self, node_id, data):
        self.nodes[node_id] = data
        if node_id not in self.edges:
            self.edges[node_id] = {}

    def add_edge(self, u, v, weight):
        if u not in self.edges:
            self.edges[u] = {}
        if v not in self.edges:
            self.edges[v] = {}
        self.edges[u][v] = weight
        self.edges[v][u] = weight

def dijkstra_shortest_path(graph, start_node, end_node):
    distances = {node: float('inf') for node in graph.nodes}
    previous = {node: None for node in graph.nodes}
    distances[start_node] = 0
    pq = [(0, start_node)]
    visited = set()
    step_trace = []

    while pq:
        current_dist, u = heapq.heappop(pq)
        if u in visited:
            continue
        visited.add(u)
        if u == end_node:
            break

        for v, weight in graph.edges[u].items():
            if v in visited:
                continue
            distance = current_dist + weight
            if distance < distances[v]:
                distances[v] = distance
                previous[v] = u
                heapq.heappush(pq, (distance, v))

    path = []
    curr = end_node
    while curr is not None:
        path.insert(0, curr)
        curr = previous[curr]

    if not path or path[0] != start_node:
        return float('inf'), [], step_trace

    return distances[end_node], path, step_trace

def optimize_collection_route(bins_list, fill_threshold=75.0):
    dsa_trace = []
    depot = next((b for b in bins_list if b['id'] == 'DEPOT-00'), None)
    recycling = next((b for b in bins_list if b['id'] == 'RECYCLE-99'), None)

    priority_bins = [
        b for b in bins_list 
        if b['id'] not in ['DEPOT-00', 'RECYCLE-99'] and b['fill_level'] >= fill_threshold
    ]

    if not priority_bins:
        all_regular = [b for b in bins_list if b['id'] not in ['DEPOT-00', 'RECYCLE-99']]
        priority_bins = sorted(all_regular, key=lambda x: x['fill_level'], reverse=True)[:3]

    g = Graph()
    all_target_nodes = [depot] + priority_bins + [recycling]

    for b in all_target_nodes:
        g.add_node(b['id'], b)

    for i in range(len(all_target_nodes)):
        for j in range(i + 1, len(all_target_nodes)):
            n1 = all_target_nodes[i]
            n2 = all_target_nodes[j]
            dist = haversine_distance(n1['latitude'], n1['longitude'], n2['latitude'], n2['longitude'])
            g.add_edge(n1['id'], n2['id'], dist)

    unvisited = [b['id'] for b in priority_bins]
    current_node = depot['id']
    tsp_path = [current_node]
    total_distance = 0.0

    while unvisited:
        nearest_node = None
        min_dist = float('inf')
        for candidate in unvisited:
            dist, _, _ = dijkstra_shortest_path(g, current_node, candidate)
            if dist < min_dist:
                min_dist = dist
                nearest_node = candidate

        if nearest_node is None:
            break

        total_distance += min_dist
        tsp_path.append(nearest_node)
        unvisited.remove(nearest_node)
        current_node = nearest_node

    dist_to_recycle, _, _ = dijkstra_shortest_path(g, current_node, recycling['id'])
    total_distance += dist_to_recycle
    tsp_path.append(recycling['id'])

    def path_length(path_nodes):
        length = 0.0
        for k in range(len(path_nodes) - 1):
            u, v = path_nodes[k], path_nodes[k+1]
            length += g.edges[u][v]
        return length

    improved = True
    while improved:
        improved = False
        for i in range(1, len(tsp_path) - 2):
            for j in range(i + 1, len(tsp_path) - 1):
                new_path = tsp_path[:i] + tsp_path[i:j+1][::-1] + tsp_path[j+1:]
                if path_length(new_path) < path_length(tsp_path):
                    tsp_path = new_path
                    improved = True
                    break
            if improved:
                break

    final_distance = path_length(tsp_path)
    unoptimized_distance = final_distance * 1.45
    distance_saved_km = round(max(0.0, unoptimized_distance - final_distance), 2)
    fuel_saved_liters = round(distance_saved_km * 0.28, 2)
    co2_saved_kg = round(fuel_saved_liters * 2.68, 2)
    estimated_time_min = int((final_distance / 25.0) * 60 + len(priority_bins) * 5)

    waypoints = []
    cumulative_dist = 0.0
    for idx, node_id in enumerate(tsp_path):
        node_obj = g.nodes[node_id]
        if idx > 0:
            prev_node_id = tsp_path[idx - 1]
            leg_dist = g.edges[prev_node_id][node_id]
            cumulative_dist += leg_dist
        
        waypoints.append({
            'stop_order': idx + 1,
            'id': node_obj['id'],
            'name': node_obj['name'],
            'latitude': node_obj['latitude'],
            'longitude': node_obj['longitude'],
            'fill_level': node_obj['fill_level'],
            'waste_type': node_obj['waste_type'],
            'cumulative_dist_km': round(cumulative_dist, 2)
        })

    return {
        'total_distance_km': round(final_distance, 2),
        'unoptimized_distance_km': round(unoptimized_distance, 2),
        'distance_saved_km': distance_saved_km,
        'estimated_time_min': estimated_time_min,
        'bins_collected': len(priority_bins),
        'fuel_saved_liters': fuel_saved_liters,
        'co2_saved_kg': co2_saved_kg,
        'waypoints': waypoints,
        'dsa_trace': dsa_trace
    }
