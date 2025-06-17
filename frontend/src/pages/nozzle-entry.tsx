import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Input, Select, message, Typography, Row, Col } from 'antd';
import { GiFuelPump } from 'react-icons/gi';

const { Title } = Typography;

export default function NozzleReadingEntry() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [pumps, setPumps] = useState([]);
  const [nozzles, setNozzles] = useState([]);
  const [prevReadings, setPrevReadings] = useState({});
  const [fuelPrices, setFuelPrices] = useState({});
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalSales, setTotalSales] = useState(0);

  // Fetch stations on mount
  useEffect(() => {
    axios.get('/api/stations').then(res => setStations(res.data));
  }, []);

  // Fetch pumps, nozzles, prev readings, prices when station changes
  useEffect(() => {
    if (!selectedStation) return;
    setLoading(true);
    Promise.all([
      axios.get(`/api/pumps/station/${selectedStation}`),
      axios.get(`/api/nozzles/station/${selectedStation}`),
      axios.get(`/api/stations/${selectedStation}/nozzle-readings/previous`),
      axios.get(`/api/stations/${selectedStation}/fuel-prices`)
    ]).then(([pumpsRes, nozzlesRes, prevRes, pricesRes]) => {
      setPumps(pumpsRes.data);
      setNozzles(nozzlesRes.data);
      setPrevReadings(Object.fromEntries(prevRes.data.map(r => [r.nozzle_id, r.previous_reading || 0])));
      setFuelPrices(Object.fromEntries(pricesRes.data.map(p => [p.nozzle_id, p.price])));
      setReadings({});
      setTotalSales(0);
    }).finally(() => setLoading(false));
  }, [selectedStation]);

  // Calculate total sales whenever readings change
  useEffect(() => {
    let total = 0;
    for (const nozzle of nozzles) {
      const prev = prevReadings[nozzle.id] || 0;
      const curr = readings[nozzle.id] || prev;
      const sold = Math.max(0, curr - prev);
      const price = fuelPrices[nozzle.id] || 0;
      total += sold * price;
    }
    setTotalSales(total);
  }, [readings, nozzles, prevReadings, fuelPrices]);

  const handleReadingChange = (nozzleId, value) => {
    setReadings(r => ({ ...r, [nozzleId]: value }));
  };

  const handleSubmit = async () => {
    // Validate readings
    for (const nozzle of nozzles) {
      const prev = prevReadings[nozzle.id] || 0;
      const curr = readings[nozzle.id];
      if (curr === undefined || curr === null || isNaN(curr)) {
        return message.error(`Please enter reading for nozzle ${nozzle.name}`);
      }
      if (curr < prev) {
        return message.error(`Reading for nozzle ${nozzle.name} cannot be less than previous (${prev})`);
      }
    }
    setLoading(true);
    try {
      await axios.post(`/api/stations/${selectedStation}/nozzle-readings`, {
        readings: nozzles.map(n => ({ nozzleId: n.id, reading: readings[n.id] }))
      });
      message.success('Readings submitted successfully!');
      setReadings({});
    } catch (err) {
      message.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card loading={loading} style={{ maxWidth: 900, margin: 'auto' }}>
      <Title level={3}>Daily Nozzle Reading Entry</Title>
      <Select
        style={{ width: 300, marginBottom: 24 }}
        placeholder="Select Station"
        value={selectedStation}
        onChange={setSelectedStation}
        options={stations.map(s => ({ label: s.name, value: s.id }))}
      />
      {pumps.map(pump => (
        <Card key={pump.id} style={{ margin: '16px 0', background: '#f6f9fc' }}>
          <Row align="middle">
            <Col span={2}><GiFuelPump size={32} /></Col>
            <Col span={22}><b>{pump.name}</b></Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 12 }}>
            {nozzles.filter(n => n.pump_id === pump.id).map(nozzle => {
              const prev = prevReadings[nozzle.id] || 0;
              const curr = readings[nozzle.id] ?? prev;
              const sold = Math.max(0, curr - prev);
              const price = fuelPrices[nozzle.id] || 0;
              return (
                <Col key={nozzle.id} span={8} style={{ marginBottom: 16 }}>
                  <Card size="small" title={<span>{nozzle.name} <b>({nozzle.fuel_type})</b></span>}>
                    <div>Prev: <b>{prev}</b></div>
                    <Input
                      type="number"
                      min={prev}
                      value={curr}
                      onChange={e => handleReadingChange(nozzle.id, Number(e.target.value))}
                      style={{ width: '100%', margin: '8px 0' }}
                    />
                    <div>Sold: <b>{sold}</b> @ ₹{price} = <b>₹{(sold * price)?.toFixed(2)}</b></div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      ))}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <b>Total Sales: ₹{totalSales?.toFixed(2)}</b>
      </div>
      <Button type="primary" onClick={handleSubmit} loading={loading} style={{ marginTop: 16 }}>
        Submit Readings
      </Button>
    </Card>
  );
}
