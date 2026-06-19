@extends('layouts.admin')

@section('title')
    Store Settings
@endsection

@section('content-header')
    <h1>Store Settings<small>Configure pricing and resource allocations for the client store.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Store</li>
    </ol>
@endsection

@section('content')
    <form action="{{ route('admin.store') }}" method="POST">
        {!! csrf_field() !!}

        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.2)); color: #86efac;">
                    <i class="fa fa-shopping-cart"></i>
                </div>
                <div>
                    <h3>Store Configuration</h3>
                    <p>Enable the store and select the default deployment node</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid">
                    <div class="settings-field">
                        <label>Enable Store</label>
                        @php
                            $storeEnabled = old('store:enabled', config('store.enabled', '1'));
                        @endphp
                        <div class="settings-toggle-group" data-toggle="buttons">
                            <label class="btn @if ($storeEnabled == '0') active @endif">
                                <input type="radio" name="store:enabled" autocomplete="off" value="0" @if ($storeEnabled == '0') checked @endif> Disabled
                            </label>
                            <label class="btn @if ($storeEnabled == '1') active @endif">
                                <input type="radio" name="store:enabled" autocomplete="off" value="1" @if ($storeEnabled == '1') checked @endif> Enabled
                            </label>
                        </div>
                        <div class="field-hint">Allow clients to access the store and purchase servers.</div>
                    </div>
                    <div class="settings-field">
                        <label>Default Deployment Node</label>
                        <select name="store:node_id" class="form-control">
                            <option value="">-- Select a Node --</option>
                            @foreach($nodes as $node)
                                <option value="{{ $node->id }}" @if(old('store:node_id', config('store.node_id')) == $node->id) selected @endif>{{ $node->name }}</option>
                            @endforeach
                        </select>
                        <div class="field-hint">The node where all store servers will be automatically deployed.</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="settings-card">
            <div class="settings-card-header">
                <div class="icon-wrap" style="background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2)); color: #93c5fd;">
                    <i class="fa fa-money"></i>
                </div>
                <div>
                    <h3>Resource Pricing</h3>
                    <p>Set the price in your currency (e.g. IDR) for each resource unit</p>
                </div>
            </div>
            <div class="settings-card-body">
                <div class="settings-grid-3">
                    <div class="settings-field">
                        <label>CPU Price (per 10%)</label>
                        <input type="number" required class="form-control" name="store:price:cpu" value="{{ old('store:price:cpu', config('store.price.cpu', 1000)) }}">
                        <div class="field-hint">Price for every 10% of CPU limit.</div>
                    </div>
                    <div class="settings-field">
                        <label>RAM Price (per 1GB)</label>
                        <input type="number" required class="form-control" name="store:price:ram" value="{{ old('store:price:ram', config('store.price.ram', 5000)) }}">
                        <div class="field-hint">Price for every 1024MB (1GB) of RAM.</div>
                    </div>
                    <div class="settings-field">
                        <label>Disk Price (per 1GB)</label>
                        <input type="number" required class="form-control" name="store:price:disk" value="{{ old('store:price:disk', config('store.price.disk', 2000)) }}">
                        <div class="field-hint">Price for every 1024MB (1GB) of Disk space.</div>
                    </div>
                    <div class="settings-field">
                        <label>Database Price (per 1 db)</label>
                        <input type="number" required class="form-control" name="store:price:database" value="{{ old('store:price:database', config('store.price.database', 1000)) }}">
                        <div class="field-hint">Price for each additional database allocation.</div>
                    </div>
                    <div class="settings-field">
                        <label>Backup Price (per 1 backup)</label>
                        <input type="number" required class="form-control" name="store:price:backup" value="{{ old('store:price:backup', config('store.price.backup', 1000)) }}">
                        <div class="field-hint">Price for each additional backup limit.</div>
                    </div>
                    <div class="settings-field">
                        <label>Allocation/Port Price (per 1 port)</label>
                        <input type="number" required class="form-control" name="store:price:port" value="{{ old('store:price:port', config('store.price.port', 500)) }}">
                        <div class="field-hint">Price for each additional network allocation (port).</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: flex-end; padding-bottom: 20px;">
            <button type="submit" name="_method" value="PATCH" class="settings-save-btn">
                <i class="fa fa-check" style="margin-right: 8px;"></i> Save Changes
            </button>
        </div>
    </form>
@endsection
