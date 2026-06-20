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
    @include('partials.admin.shared-css')
    
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
                <div class="icon-wrap" style="background: linear-gradient(135deg, #a855f7, #9333ea); color: #e9d5ff;">
                    <i class="fa fa-cubes"></i>
                </div>
                <div>
                    <h3>Store Packages</h3>
                    <p>Manage the predefined packages that users can purchase.</p>
                </div>
            </div>
            <div class="settings-card-body" style="padding: 20px;">
                <a href="{{ route('admin.store.packages') }}" class="btn btn-primary" style="background: #9333ea; border: none; padding: 10px 20px; font-weight: bold;">
                    <i class="fa fa-list"></i> Manage Packages
                </a>
                <p style="margin-top: 10px; color: #a1a1aa;">The old resource pricing has been replaced by the new Package-Based system.</p>
            </div>
        </div>

        <div style="display: flex; justify-content: flex-end; padding-bottom: 20px;">
            <button type="submit" name="_method" value="PATCH" class="settings-save-btn">
                <i class="fa fa-check" style="margin-right: 8px;"></i> Save Changes
            </button>
        </div>
    </form>
@endsection
