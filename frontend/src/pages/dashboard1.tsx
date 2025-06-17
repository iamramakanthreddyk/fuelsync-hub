import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { Line, Pie } from '@ant-design/charts';

const { Title } = Typography;

export default function OwnerDashboard() {
  const [stationId, setStationId] = useState(null);
  const [stations, setStations] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/stations').then(res => setStations(res.data));
  }, []);

  useEffect(() => {
    if (!stationId) return;
    axios.get(`/api/dashboard?stationId=${stationId}`).then(res => setData(res.data));
  }, [stationId]);

  if (!data) return (
    <Card style={{ maxWidth: 900, margin: 'auto' }}>
      <Title level={3}>Owner/Manager Dashboard</Title>
      <select onChange={e => setStationId(e.target.value)} value={stationId || ''}>
        <option value="">Select Station</option>
        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </Card>
  );

  return (
    <Card style={{ maxWidth: 900, margin: 'auto' }}>
      <Title level={3}>Owner/Manager Dashboard</Title>
      <select onChange={e => setStationId(e.target.value)} value={stationId || ''} style={{ marginBottom: 24 }}>
        <option value="">Select Station</option>
        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="Today's Fuel Prices">
            {data.prices.map(p => (
              <div key={p.fuel_type}>{p.fuel_type}: <b>₹{p.price}</b></div>
            ))}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Today's Sales">
            <Statistic title="Total Sales (₹)" value={data.sales.total_amount || 0} precision={2} />
            <Statistic title="Total Volume (L)" value={data.sales.total_volume || 0} precision={2} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Outstanding Credits">
            <Statistic title="Total Credit (₹)" value={data.totalCredit || 0} precision={2} />
            <div style={{ marginTop: 8 }}>
              {data.creditors.map(c => (
                <div key={c.customer_name}>
                  {c.customer_name}: <b>₹{c.outstanding}</b> (Last: {c.last_sale?.slice(0,10)})
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="7-Day Sales Trend">
            <Line
              data={data.trend}
              xField="sale_date"
              yField="total_amount"
              point={{ size: 4 }}
              color="#1890ff"
              height={220}
              autoFit
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Payment Breakdown">
            <Pie
              data={data.payments}
              angleField="total"
              colorField="payment_method"
              radius={0.9}
              label={{ type: 'outer', content: '{name}: {percentage}' }}
              height={220}
              autoFit
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
